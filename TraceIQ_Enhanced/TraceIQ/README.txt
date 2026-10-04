TRACEIQ — ENHANCED STACK-POWERED TROUBLESHOOTING SIMULATOR
===============================================================

WHAT CHANGED
------------
The original version had only two cases and three Yes/No questions per case.
This version expands the simulator to eight technical problem areas, with
eight investigation checks per case:

1. Laptop cannot connect to Wi-Fi
2. Printer is not printing
3. Internet is slow or unstable
4. Laptop is very slow
5. No sound from the computer
6. Application will not open
7. External monitor shows no display
8. Bluetooth device will not connect

DIAGNOSTIC IMPROVEMENTS
-----------------------
- Each case has a deeper 8-step investigation chain.
- Questions are designed to isolate different fault domains instead of only
  confirming obvious symptoms.
- Diagnosis is now rule-based. It does not require one exact answer string.
- The backend chooses the most specific rule supported by the collected
  evidence, then falls back to a deeper-investigation result when evidence
  is inconclusive.
- Results show confidence and the evidence used.
- The stack/backtracking behavior remains intact: changing an earlier answer
  invalidates later diagnostic states.

IMPORTANT ACADEMIC NOTE
-----------------------
TraceIQ is still a simulation using predefined troubleshooting knowledge.
It does not inspect the user's actual computer, printer, network, or hardware.
For a classroom/demo project, describe the diagnosis as a likely cause based
on simulated evidence, not as a real device diagnosis.

RUN
---
1. Extract the ZIP.
2. Open the extracted TraceIQ folder in VS Code.
3. Open Terminal > New Terminal.
4. Run:
       python -m pip install -r requirements.txt
5. Run:
       python app.py
6. Open:
       http://127.0.0.1:5001

PROJECT STRUCTURE
-----------------
TraceIQ/
  app.py
  scenarios.py
  requirements.txt
  README.txt
  templates/index.html
  static/app.js
  static/style.css

DEMO
----
Try the Wi-Fi case and complete all eight checks. Point out the PUSH entries
and the TOP OF STACK. Then change an earlier answer to demonstrate
backtracking. Finally run another case, such as Internet slow or No sound.

VIVA POINT
----------
The stack is used to represent the sequence of diagnostic states. PUSH records
a new test state, PEEK identifies the most recent state, and changing an
earlier answer simulates backtracking by discarding later states.

NEXT POSSIBLE ENHANCEMENTS
--------------------------
- Add a visible POP/backtrack button.
- Add a custom Stack class for an academic data-structures requirement.
- Persist diagnostic sessions in SQLite.
- Add weighted confidence scoring and multi-path troubleshooting.
- Add an admin interface for adding new problem scenarios without editing
  Python code.
