// // src/routes/executor.js
// const express = require('express');
// const router = express.Router();
// const auth = require('../utils/authMiddleware');
// const ctrl = require('../controllers/executionController');

// router.post('/run', auth, ctrl.runWorkflow);
// router.get('/run/:runId', auth, ctrl.getRunLog);

// // ✅ Gmail API Test Route
// const gmail = require('../services/integrations/gmail');

// router.post('/test-gmail', async (req, res) => {
//   try {
//     const result = await gmail.sendMail({
//       to: 'ronitsinghofficial289@gmail.com', // change this to your Gmail
//       subject: 'Workflow Automation Gmail Test',
//       body: '<b>This is a test email from Workflow Automation Builder.</b>',
//       from: 'me'
//     });
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });


// module.exports = router;

// src/routes/executor.js
const express = require('express');
const router = express.Router();
const auth = require('../utils/authMiddleware');
const ctrl = require('../controllers/executionController');

const gmail = require('../services/integrations/gmail');
const sheets = require('../services/integrations/sheets');
const slack = require('../services/integrations/slack');
const discord = require('../services/integrations/discord');
const webhookCtrl = require('../controllers/webhookController');

// Existing workflow routes
router.post('/run', auth, ctrl.runWorkflow);
router.get('/run/:runId', auth, ctrl.getRunLog);

// ✅ Gmail API Test Route
router.post('/test-gmail', async (req, res) => {
  try {
    const result = await gmail.sendMail({
      to: 'ronitsinghofficial289@gmail.com',
      subject: 'Workflow Automation Gmail Test',
      body: '<b>This is a test email from Workflow Automation Builder.</b>',
      from: 'me'
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Google Sheets API Test Route
router.post('/test-sheets', async (req, res) => {
  try {
    const result = await sheets.appendRow({
      spreadsheetId: '1MAOSGk8N1YG4wy1eaZ6cjQSn8XzHYhg1MgPzi7r_0r4', // 👈 Replace this
      range: 'Sheet1!A1:C1', // Adjust according to your sheet name
      values: ['Test', 'Workflow Automation Builder', new Date().toLocaleString()]
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Slack API Test Route
router.post('/test-slack', async (req, res) => {
  try {
    const result = await slack.postMessage({
      channel: '#workflow-test', // 👈 replace with your actual Slack channel name
      text: 'Done Bro'
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/test-discord', async (req, res) => {
  try {
    const result = await discord.postMessage({
      content: 'Hogya'
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Google Form Webhook Route
router.post('/form-webhook', webhookCtrl.handleGoogleForm);
// router.post('/trigger', webhookCtrl.handleTrigger);

module.exports = router;

