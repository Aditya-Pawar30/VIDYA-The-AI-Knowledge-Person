# Chapter 3: V2.1 — Deterministic Calculator Tool & Safe AST Evaluation

## 1. High-Level Architecture Overview
LLMs are probabilistic token predictors — they guess the next word based on probability patterns. When asked math questions like *"What is 17.5% of 85,000?"*, LLMs often hallucinate arithmetic answers.

V2.1 introduces a **Deterministic Calculator Tool** that routes math queries away from LLM guesswork into a **Safe Abstract Syntax Tree (AST) Evaluator**.

```
Student Query: "Calculate 17.5% of 85,000"
               │
               ▼
[Router Node] ---> Intent detected: "CALCULATOR"
               │
               ▼
[Calculator Tool]
   ├── 1. Regex Preprocessor: "17.5% of 85000" -> "(17.5 / 100) * 85000"
   ├── 2. AST Parser: ast.parse("0.175 * 85000", mode='eval')
   └── 3. Safe AST Walker: Recursively evaluates ONLY safe Math Operators
               │
               ▼
Result: "14,875" -> Passed to [Generate Answer Node] -> LLM presents formatted answer
```

---

## 2. Core Concepts & Topics Used

### A. Abstract Syntax Trees (AST)
- **What it is**: A tree representation of the syntactic structure of source code.
- **Example**: `5 + 3` becomes:
  ```
       BinOp (Add)
      /            Constant(5)  Constant(3)
  ```

### B. Security & Safe Evaluation vs Python `eval()`
- **Dangers of `eval()`**:
  Using Python's built-in `eval("17.5 * 850")` is extremely dangerous. An attacker passing `"__import__('os').system('rm -rf /')"` would execute arbitrary code on your server!
- **Safe AST Walker Solution**:
  Our custom walker inspects every node in the AST tree before executing it. If a node is an import, function call, loop, or variable reference, it raises `ValueError("Unsupported AST node")`. It ONLY permits numeric constants and safe math operators (`+`, `-`, `*`, `/`, `%`, `**`).

---

## 3. Line-by-Line Code Breakdown

### `app/tools.py` (`_safe_eval_ast` & `safe_evaluate`)
```python
import ast
import operator
import re

SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

def _safe_eval_ast(node):
    if isinstance(node, ast.Constant):      # Line 32: Numbers (int, float)
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant: {type(node.value)}")

    elif isinstance(node, ast.BinOp):       # Line 37: Binary operations (e.g. 5 + 3)
        op_type = type(node.op)
        if op_type in SAFE_OPERATORS:
            left = _safe_eval_ast(node.left)
            right = _safe_eval_ast(node.right)
            return SAFE_OPERATORS[op_type](left, right) # Line 42: Apply operator
        raise ValueError(f"Unsupported operator: {op_type}")

    raise ValueError(f"Unsupported AST node: {type(node)}") # Line 51: Security block!
```
* **Line 42**: `SAFE_OPERATORS[op_type](left, right)` maps the AST operator (`ast.Add`) directly to Python's math function (`operator.add(left, right)`).
* **Line 51**: Anything non-math (e.g. `__import__`, `open()`, `eval()`) hits Line 51 and is immediately blocked.

### Preprocessing & Formatting (`safe_evaluate` & `calculator_tool`)
```python
def safe_evaluate(expression_str: str) -> float:
    # 1. Convert percentages: "17.5% of 85000" -> "(17.5 / 100) * 85000"
    expr = re.sub(r'(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)', r'( / 100) * ', expression_str, flags=re.IGNORECASE)
    expr = re.sub(r'(\d+(?:\.\d+)?)\s*%', r'( / 100)', expr)

    # 2. Convert word symbols
    expr = expr.replace("×", "*").replace("÷", "/").replace("x", "*")

    # 3. Strip invalid non-math characters
    cleaned = re.sub(r'[^0-9\+\-\*\/\%\.\(\)\s]', '', expr).strip()

    parsed = ast.parse(cleaned, mode='eval')
    return _safe_eval_ast(parsed.body)
```

---

## 4. Architectural Alternatives & Tradeoffs Summary

| Feature | Selected Choice | Alternative Option | Why Selected over Alternative? |
| :--- | :--- | :--- | :--- |
| **Math Execution** | Safe AST Walker | Python `eval()` | `eval()` has catastrophic Remote Code Execution (RCE) vulnerabilities. AST walker is 100% safe. |
| **Math Handling** | Deterministic CPU Tool | Direct LLM Guesswork | LLMs hallucinate math operations. CPU AST walker guarantees 100% precision. |
