from flask import Flask, render_template, request, jsonify
from scenarios import SCENARIOS

app = Flask(__name__)


def rule_matches(conditions, answers):
    return all(answers.get(key) == value for key, value in conditions.items())


def diagnose_scenario(scenario, answers):
    matches = []
    for rule in scenario.get("rules", []):
        conditions, title, explanation, actions, *rest = rule
        confidence = rest[0] if rest else "Medium"
        if rule_matches(conditions, answers):
            matches.append({
                "conditions": conditions,
                "title": title,
                "explanation": explanation,
                "actions": actions,
                "confidence": confidence,
                "specificity": len(conditions)
            })

    # Prefer the rule supported by the largest number of independent observations.
    if matches:
        matches.sort(key=lambda item: item["specificity"], reverse=True)
        return matches[0]

    fb = scenario["fallback"]
    return {
        "title": fb["title"],
        "explanation": fb["explanation"],
        "actions": fb["actions"],
        "confidence": fb.get("confidence", "Medium"),
        "conditions": {}
    }


@app.get("/")
def index():
    return render_template("index.html", scenarios=SCENARIOS)


@app.get("/api/scenarios")
def scenarios():
    return jsonify(SCENARIOS)


@app.post("/api/diagnose")
def diagnose():
    data = request.get_json(silent=True) or {}
    scenario_id = data.get("scenario_id")
    answers = data.get("answers", {})
    scenario = next((s for s in SCENARIOS if s["id"] == scenario_id), None)
    if not scenario:
        return jsonify({"error": "Unknown scenario"}), 404

    stack = []
    path = []
    for step in scenario["steps"]:
        answer = answers.get(step["id"], "Not tested")
        entry = {
            "step": step["title"],
            "question": step["question"],
            "answer": answer,
            "result": step["outcomes"].get(answer, "No result recorded")
        }
        stack.append(entry)
        path.append(entry)

    result = diagnose_scenario(scenario, answers)
    evidence = [
        f"{step['title']}: {answers[step['id']]}"
        for step in scenario["steps"]
        if step["id"] in answers
    ]

    return jsonify({
        "diagnosis": result["title"],
        "explanation": result["explanation"],
        "recommended_actions": result["actions"],
        "confidence": result["confidence"],
        "evidence": evidence,
        "stack": stack,
        "path": path,
        "stack_size": len(stack),
        "top": stack[-1]["step"] if stack else None
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)
