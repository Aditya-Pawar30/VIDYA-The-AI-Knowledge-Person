# Milestone 8: PDF-Based Question Suggestions

The goal is to automatically analyze the uploaded PDF and generate 5-7 intelligent, varied questions (Understand, Simplify, Example, Compare, Deepen, Practice) for the student to ask VIDYA. This acts as a set of "Suggested Questions" immediately after upload.

I have created this plan for your review. I will also save a copy to the `plans/` folder.

## User Review Required

Does this approach for generating suggestions look good? For this milestone, I will pass the full extracted text of the PDF to the LLM to generate the questions. This works perfectly for our current `sample.pdf`. (For very large PDFs in the future, we might need to chunk this process, but let's keep it simple and robust for now).

## Proposed Changes

### `app/llm.py`
- **[NEW]** Add a new system prompt `SUGGESTION_PROMPT` specifically tuned to generate 5-7 questions based on different learning intentions (Understand, Simplify, Example, Compare, Deepen, Practice).
- **[NEW]** Add a new function `generate_suggestions(document_text: str) -> list[str]`. This function will:
  - Call the Groq LLM with the `SUGGESTION_PROMPT` and the document text.
  - Ask the LLM to return the questions in a clean, newline-separated format or JSON array.
  - Parse the LLM's response into a Python list of strings.

### `app/main.py`
- **[MODIFY]** Update the pipeline script to immediately call `generate_suggestions(text)` after `load_pdf()`.
- **[MODIFY]** Print the suggested questions to the console in a nice UI-like format before running the manual tests.

## Verification Plan

### Automated Tests
I will run `python -m app.main` which will:
1. Extract text from `data/sample.pdf`.
2. Generate 5-7 suggested questions and print them.
3. Proceed with chunking, embedding, and existing tests 1-6 to ensure nothing was broken.

### Manual Verification
Reviewing the terminal output to ensure the suggested questions match the content of the `sample.pdf` and have the varied learning intentions you specified.
