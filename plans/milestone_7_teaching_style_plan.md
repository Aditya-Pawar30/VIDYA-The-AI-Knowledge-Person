# Goal Description

The goal is to implement a dynamic teaching style feature in VIDYA. This allows students to have a default teaching style (Simple, Normal, Detailed) while still allowing them to override this default naturally by adding instructions in their questions (e.g., "Explain like I'm a beginner"). This must integrate smoothly with the existing PDF + AI RAG pipeline without breaking it.

As requested, I have also created a `plans` folder in your project to save this and future plans.

## User Review Required

Please review the proposed prompt additions in `app/llm.py`. I want to make sure the instructions given to the LLM align with how you want VIDYA to behave. 

## Proposed Changes

### `app/llm.py`

- **[MODIFY]** Update `ask_vidya` to accept a new parameter: `default_style: str = "Normal"`.
- **[MODIFY]** Update `build_prompt` to include this `default_style` and instruct the LLM on how to behave.
- **[MODIFY]** Add a specific rule to the `SYSTEM_PROMPT` or user message instructing the LLM: *"Your default teaching style is {default_style}. However, if the student explicitly asks for a different style in their question (e.g., 'explain simply'), you MUST prioritize their instruction."*

### `app/main.py`

- **[MODIFY]** Update the `ask()` helper function to accept a `default_style` parameter.
- **[MODIFY]** Add test cases to verify:
  1. Default style works (e.g., Default: Detailed).
  2. Override works (Default: Detailed, but question says "Explain in simple words").
  3. PDF + AI behavior remains intact.

## Verification Plan

### Automated Tests
I will run `python -m app.main` which will execute the new test cases:
1. **TEST 4** - Default style Normal (Control)
2. **TEST 5** - Default style Detailed (Testing default style injection)
3. **TEST 6** - Default style Detailed, but user overrides with "explain in simple words" (Testing override capability)

### Manual Verification
Reviewing the terminal output to ensure the LLM's language adjusts based on the requested style and still uses the PDF chunks appropriately.
