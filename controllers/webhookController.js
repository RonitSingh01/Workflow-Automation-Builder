// const executor = require('../services/executor');
// const Workflow = require('../models/Workflow');

// exports.handleGoogleForm = async (req, res) => {
//   try {
//     console.log('Received Google Form submission:', req.body);

//     // Find workflow with trigger = google_form
//     const workflow = await Workflow.findOne({ 'definition.trigger.type': 'google_form' });
//     if (!workflow) return res.status(404).json({ error: 'No Google Form workflow found' });

//     // Execute workflow automatically
//     const runId = await executor.executeWorkflow(workflow._id, { email: 'form_trigger@system' });

//     res.json({ message: 'Workflow triggered successfully', runId });
//   } catch (err) {
//     console.error('Webhook error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// src/controllers/webhookController.js
// src/controllers/webhookController.js
// const Workflow = require('../models/Workflow');
// const executor = require('../services/executor');

// exports.handleGoogleForm = async (req, res) => {
//   try {
//     console.log('📩 Received Google Form submission:', req.body);

//     // ✅ Corrected workflow lookup
//     const workflow = await Workflow.findOne({
//       'nodes.type': 'trigger',
//       name: 'Universal'
//     });

//     if (!workflow) {
//       console.error('❌ No matching workflow found in database');
//       return res.status(404).json({ error: 'No matching workflow found in database' });
//     }

//     console.log('✅ Workflow found:', workflow.name);

//     // Run the workflow
//     const runId = await executor.executeWorkflow(workflow._id, { email: 'system@workflow.com' });

//     res.json({ ok: true, message: 'Workflow executed successfully', runId });
//   } catch (err) {
//     console.error('💥 Webhook error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };



// src/controllers/webhookController.js
const Workflow = require('../models/Workflow');
const executor = require('../services/executor');

exports.handleGoogleForm = async (req, res) => {
  try {
    console.log('📩 Received Google Form submission:', req.body);

    // ✅ Corrected workflow lookup (must include "definition.")
    const workflow = await Workflow.findOne({
      'definition.nodes': { $elemMatch: { type: 'trigger' } },
      name: 'Google Form → Gmail → Sheets'
    });

    if (!workflow) {
      console.error('❌ No matching workflow found in database');
      return res.status(404).json({ error: 'No matching workflow found in database' });
    }

    console.log('✅ Workflow found:', workflow.name);

    // Run the workflow
    const runId = await executor.executeWorkflow(workflow._id, { email: 'system@workflow.com' });

    res.json({ ok: true, message: 'Workflow executed successfully', runId });
  } catch (err) {
    console.error('💥 Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
};
