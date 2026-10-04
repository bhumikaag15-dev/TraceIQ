let scenarios = [];
let selectedId = null;
let answers = {};
let stack = [];
let logEntries = [];

const questionsEl = document.getElementById("questions");
const stackEl = document.getElementById("stack-items");
const logEl = document.getElementById("log");
const diagnoseBtn = document.getElementById("diagnose");

async function init() {
  const response = await fetch("/api/scenarios");
  scenarios = await response.json();
  document.querySelectorAll(".scenario-card").forEach(card => {
    card.addEventListener("click", () => selectScenario(card.dataset.id));
  });
  selectedId = scenarios[0]?.id;
  if (selectedId) selectScenario(selectedId);
}

function currentScenario() {
  return scenarios.find(s => s.id === selectedId);
}

function selectScenario(id) {
  selectedId = id;
  answers = {};
  stack = [];
  logEntries = [];
  document.querySelectorAll(".scenario-card").forEach(c => c.classList.toggle("selected", c.dataset.id === id));
  document.getElementById("result").classList.add("hidden");
  renderQuestions();
  renderStack();
  renderLog("Waiting for your first test…");
  document.getElementById("scenario-description").textContent = currentScenario().description;
  updateProgress();
}

function renderQuestions() {
  const scenario = currentScenario();
  questionsEl.innerHTML = "";
  scenario.steps.forEach((step, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question";
    const title = document.createElement("div");
    title.className = "question-title";
    title.textContent = `${String(index + 1).padStart(2, "0")}  ${step.question}`;
    const choices = document.createElement("div");
    choices.className = "choices";
    ["Yes", "No"].forEach(value => {
      const button = document.createElement("button");
      button.className = "choice" + (answers[step.id] === value ? " active" : "");
      button.textContent = value;
      button.addEventListener("click", () => recordAnswer(step, value));
      choices.appendChild(button);
    });
    wrapper.append(title, choices);
    questionsEl.appendChild(wrapper);
  });
}

function recordAnswer(step, value) {
  answers[step.id] = value;
  const index = currentScenario().steps.findIndex(s => s.id === step.id);

  // Backtracking: changing an earlier answer invalidates every later state.
  stack = currentScenario().steps.slice(0, index + 1).filter(s => answers[s.id]).map(s => ({
    title: s.title, answer: answers[s.id], result: s.outcomes[answers[s.id]]
  }));
  logEntries.push(`PUSH → ${step.title}: ${value}`);
  renderQuestions();
  renderStack();
  renderLog();
  updateProgress();
  document.getElementById("result").classList.add("hidden");
}

function updateProgress() {
  const count = Object.keys(answers).length;
  const total = currentScenario().steps.length;
  document.getElementById("progress").textContent = `${count} / ${total} COMPLETE`;
  diagnoseBtn.disabled = count !== total;
}

function renderStack() {
  document.getElementById("stack-count").textContent = stack.length;
  stackEl.innerHTML = "";
  if (!stack.length) {
    stackEl.innerHTML = '<div class="empty-stack">Your diagnostic states<br>will appear here.</div>';
    return;
  }
  stack.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "stack-item" + (i === stack.length - 1 ? " top" : "");
    const strong = document.createElement("strong");
    strong.textContent = `${i === stack.length - 1 ? "TOP · " : ""}${item.title}`;
    const small = document.createElement("small");
    small.textContent = `${item.answer} — ${item.result}`;
    card.append(strong, small);
    stackEl.appendChild(card);
  });
}

function renderLog(emptyText) {
  logEl.innerHTML = "";
  if (!logEntries.length) {
    const p = document.createElement("p");
    p.textContent = emptyText || "Waiting for your first test…";
    logEl.appendChild(p);
    return;
  }
  logEntries.slice(-8).reverse().forEach(entry => {
    const p = document.createElement("p");
    p.className = "push";
    p.textContent = entry;
    logEl.appendChild(p);
  });
}

diagnoseBtn.addEventListener("click", async () => {
  const response = await fetch("/api/diagnose", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({scenario_id: selectedId, answers})
  });
  const result = await response.json();

  document.getElementById("result-title").textContent = result.diagnosis;
  document.getElementById("result-explanation").textContent = result.explanation;
  document.getElementById("result-confidence").textContent = `${result.confidence} confidence`;

  const list = document.getElementById("result-actions");
  list.innerHTML = "";
  result.recommended_actions.forEach(action => {
    const li = document.createElement("li");
    li.textContent = action;
    list.appendChild(li);
  });

  const evidenceList = document.getElementById("result-evidence");
  evidenceList.innerHTML = "";
  (result.evidence || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    evidenceList.appendChild(li);
  });

  document.getElementById("result-meta").textContent =
    `STACK SIZE: ${result.stack_size} · TOP: ${result.top || "EMPTY"}`;
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").scrollIntoView({behavior: "smooth", block: "nearest"});
  logEntries.push(`PEEK → ${result.top || "Stack is empty"}`, "DIAGNOSIS → completed");
  renderLog();
});

document.getElementById("reset").addEventListener("click", () => selectScenario(selectedId));
document.getElementById("again").addEventListener("click", () => selectScenario(selectedId));
init();
