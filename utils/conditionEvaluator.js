// src/utils/conditionEvaluator.js
/**
 * Very small condition evaluator.
 * condition examples:
 *  - outputs.node1.status == "success"
 *  - outputs.node1.count > 5
 *  - outputs.node1.text contains "hello"
 *
 * outMap: { nodeId: { ... } }
 */

function getValueFromPath(obj, path) {
  // path like outputs.node1.field
  const parts = path.split('.');
  // expect outputs.<nodeId>.<field>
  if (parts[0] !== 'outputs') return undefined;
  const nodeId = parts[1];
  const fieldPath = parts.slice(2);
  let node = obj[nodeId];
  if (node === undefined) return undefined;
  let val = node;
  for (const p of fieldPath) {
    if (val == null) return undefined;
    val = val[p];
  }
  return val;
}

function evaluate(condition, outputs) {
  if (!condition) return false;
  // normalize
  const cond = condition.trim();
  // check for ' contains '
  if (cond.includes(' contains ')) {
    const [left, right] = cond.split(' contains ').map(s => s.trim());
    const leftVal = getValueFromPath(outputs, left);
    const rightVal = parseLiteral(right);
    if (leftVal == null) return false;
    return ('' + leftVal).includes('' + rightVal);
  }
  // equality / inequality or > < >= <=
  const ops = ['==', '!=', '>=', '<=', '>', '<'];
  for (const op of ops) {
    const idx = cond.indexOf(op);
    if (idx > -1) {
      const left = cond.slice(0, idx).trim();
      const right = cond.slice(idx + op.length).trim();
      const leftVal = getValueFromPath(outputs, left);
      const rightVal = parseLiteral(right);
      return compare(leftVal, rightVal, op);
    }
  }
  return false;
}

function parseLiteral(token) {
  // remove surrounding quotes if present
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    return token.slice(1, -1);
  }
  if (!isNaN(token)) return Number(token);
  if (token === 'true') return true;
  if (token === 'false') return false;
  return token;
}

function compare(a, b, op) {
  if (op === '==') return a == b;
  if (op === '!=') return a != b;
  if (op === '>') return Number(a) > Number(b);
  if (op === '<') return Number(a) < Number(b);
  if (op === '>=') return Number(a) >= Number(b);
  if (op === '<=') return Number(a) <= Number(b);
  return false;
}

module.exports = { evaluate };
