// src/services/executor.js
const Workflow = require('../models/Workflow');
const Log = require('../models/Log');
const { v4: uuidv4 } = require('uuid');

const gmail = require('./integrations/gmail');
const sheets = require('./integrations/sheets');
const slack = require('./integrations/slack');
const discord = require('./integrations/discord');

const condEval = require('../utils/conditionEvaluator');

async function executeWorkflow(workflowId, user) {
  const wf = await Workflow.findById(workflowId);
  if (!wf) throw new Error('Workflow not found');

  const runId = uuidv4();
  const log = new Log({ workflowId: wf._id, runId, status: 'running', details: {} });
  await log.save();

  // build adjacency map
  const nodes = wf.definition.nodes || [];
  const edges = wf.definition.edges || [];
  // ✅ Fix: Support both formats (old + new)
  // const nodes = wf.nodes || (wf.definition && wf.definition.nodes) || [];
  // const edges = wf.edges || (wf.definition && wf.definition.edges) || [];

  const outMap = {}; // outputs per node id
  const nodeById = nodes.reduce((acc, n) => (acc[n.id] = n, acc), {});
  const nextMap = {};
  edges.forEach(e => {
    nextMap[e.source] = nextMap[e.source] || [];
    nextMap[e.source].push({ target: e.target, label: e.label });
  });

  // find trigger node(s) -> types 'trigger'
  console.log('🧩 Nodes received in executor:', nodes.map(n => n.type));
  const triggers = nodes.filter(n => n.type === 'trigger');
  if (triggers.length === 0) {
    await Log.updateOne({ runId }, { status: 'failed', details: { error: 'No trigger node' } });
    throw new Error('No trigger node defined');
  }

  // We'll run each trigger path serially for simplicity
  try {
    for (const trigger of triggers) {
      const triggerResult = { triggeredBy: user.email || user._id, timestamp: new Date() };
      outMap[trigger.id] = triggerResult;

      // traverse graph BFS/DFS - simple queue
      const queue = [...(nextMap[trigger.id] || [])];
      while (queue.length) {
        const { target } = queue.shift();
        const node = nodeById[target];
        if (!node) continue;

        let result;
        switch (node.type) {
          case 'gmail_action':
            // node.data should contain: to, subject, body
            result = await gmail.sendMail(node.data);
            break;
          case 'sheets_action':
            // node.data: spreadsheetId, range, values (array)
            result = await sheets.appendRow(node.data);
            break;
          case 'slack_action':
            result = await slack.postMessage(node.data);
            break;
          case 'discord_action':
            result = await discord.postMessage(node.data);
            break;
          case 'if_else':
            // node.data: condition (string). We evaluate it against outMap
            const cond = node.data && node.data.condition;
            const pass = condEval.evaluate(cond, outMap);
            // edges from this node may be labeled 'true' or 'false' or have specific target
            const children = nextMap[node.id] || [];
            // queue children according to pass
            children.forEach(ch => {
              // if label exists and matches pass, push; if no label push both
              if (!ch.label) queue.push(ch);
              else {
                const label = ('' + ch.label).toLowerCase();
                if ((pass && label === 'true') || (!pass && label === 'false')) queue.push(ch);
              }
            });
            result = { condition: cond, passed: pass };
            break;
          default:
            result = { info: `Unknown node type ${node.type}` };
        }

        outMap[node.id] = result;
        // if node not IF/ELSE, enqueue its children
        if (node.type !== 'if_else') {
          const children = nextMap[node.id] || [];
          children.forEach(ch => queue.push(ch));
        }

        // persist partial details occasionally
        await Log.updateOne({ runId }, { $set: { details: outMap } });
      }
    }

    await Log.updateOne({ runId }, { $set: { status: 'success', details: outMap } });
    return runId;
  } catch (err) {
    await Log.updateOne({ runId }, { $set: { status: 'failed', details: { error: err.message, stack: err.stack } } });
    throw err;
  }
}

async function getRunDetails(runId, user) {
  return Log.findOne({ runId }).populate('workflowId');
}


module.exports = { executeWorkflow, getRunDetails };
