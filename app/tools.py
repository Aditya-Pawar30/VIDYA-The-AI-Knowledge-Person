"""
tools.py — Deterministic Tool implementations for VIDYA.

Step 1 (V2.1): Calculator Tool
"""

import ast
import operator
import re

from ddgs import DDGS

# Supported safe operators for AST mathematical evaluation
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
    """
    Recursively evaluate an AST math expression node safely without using Python's unsafe eval().
    """
    if isinstance(node, ast.Constant):  # Numbers (int, float)
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant type: {type(node.value)}")

    elif isinstance(node, ast.BinOp):  # e.g., 5 + 3
        op_type = type(node.op)
        if op_type in SAFE_OPERATORS:
            left = _safe_eval_ast(node.left)
            right = _safe_eval_ast(node.right)
            return SAFE_OPERATORS[op_type](left, right)
        raise ValueError(f"Unsupported binary operator: {op_type}")

    elif isinstance(node, ast.UnaryOp):  # e.g., -5
        op_type = type(node.op)
        if op_type in SAFE_OPERATORS:
            operand = _safe_eval_ast(node.operand)
            return SAFE_OPERATORS[op_type](operand)
        raise ValueError(f"Unsupported unary operator: {op_type}")

    raise ValueError(f"Unsupported AST node: {type(node)}")


def safe_evaluate(expression_str: str) -> float:
    """
    Safely parse and evaluate a mathematical expression string.
    """
    # 1. Convert percentages: e.g. "17.5% of 85000" or "17.5%" -> "0.175 * 85000" or "0.175"
    expr = re.sub(r'(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)', r'(\1 / 100) * \2', expression_str, flags=re.IGNORECASE)
    expr = re.sub(r'(\d+(?:\.\d+)?)\s*%', r'(\1 / 100)', expr)

    # 2. Convert common word operators
    expr = expr.replace("×", "*").replace("÷", "/").replace("x", "*")

    # 3. Strip out non-math words if any remain, keeping numbers, spaces, and operators: + - * / % . ( )
    cleaned = re.sub(r'[^0-9\+\-\*\/\%\.\(\)\s]', '', expr).strip()

    if not cleaned:
        raise ValueError("No valid mathematical expression found.")

    parsed = ast.parse(cleaned, mode='eval')
    result = _safe_eval_ast(parsed.body)
    return result


def calculator_tool(query_or_expression: str) -> str:
    """
    Calculator tool that receives a query or expression and returns the exact calculated result.
    """
    try:
        res = safe_evaluate(query_or_expression)
        if isinstance(res, float):
            res = round(res, 8)
            if res.is_integer():
                res = int(res)
        return f"{res:,}" if isinstance(res, (int, float)) else str(res)
    except Exception as e:
        return f"Calculation Error: {str(e)}"


def web_search_tool(query: str, max_results: int = 4) -> str:
    """
    Web Search tool that queries DuckDuckGo for live/current web information.
    Returns structured text containing title, URL, and snippet context.
    """
    clean_query = query
    for prefix in ["search the web for", "search online for", "search the web", "search online", "search for"]:
        if clean_query.lower().startswith(prefix):
            clean_query = clean_query[len(prefix):].strip(" :")

    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(clean_query, max_results=max_results))
        
        if not results:
            return f"No web search results found for query '{clean_query}'."
        
        formatted = []
        for i, item in enumerate(results, 1):
            title = item.get("title", "No Title")
            url = item.get("href", item.get("link", "#"))
            snippet = item.get("body", item.get("snippet", "No Snippet"))
            formatted.append(f"[{i}] {title}\nURL: {url}\nSnippet: {snippet}")
        
        return "\n\n".join(formatted)
    except Exception as e:
        return f"[Web Search Note]: Search failed ({str(e)}). Unable to verify live web data."



