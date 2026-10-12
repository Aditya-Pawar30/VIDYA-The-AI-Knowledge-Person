# V3 Visual Retrieval Evaluation

## Purpose
This document tracks the performance and accuracy of the visual retrieval system (Phase 6). We measure how well the model (ColPali) finds the correct page containing the visual information requested by the student.

## Evaluation Set 1: Basic Diagrams
**PDF:** `sample.pdf`

| Question | Expected Page | Retrieved Top-1 | Retrieved Top-3 | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| "Which page contains the neural network architecture diagram?" | TBD | TBD | TBD | ⏳ Pending | Awaiting lab completion |
| "Show me the comparison table for supervised vs unsupervised learning." | TBD | TBD | TBD | ⏳ Pending | Awaiting lab completion |
| "Where is the machine learning workflow flowchart?" | TBD | TBD | TBD | ⏳ Pending | Awaiting lab completion |

## Known Limitations / False Positives
*(To be populated after testing)*
- Does the model get confused by pages with dense text but no diagrams?
- Does it hallucinate matches for vague queries?

## Performance Metrics
- **Average Indexing Time per Page:** TBD
- **Average Retrieval Latency (k=3):** TBD
- **Index Size per Page:** ~TBD MB
