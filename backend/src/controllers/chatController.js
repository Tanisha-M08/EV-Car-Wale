const path = require('path');
const { asyncHandler } = require('../utils/asyncHandler');

function createChatController(aiServicePath) {
  const resolvedPath = aiServicePath ? path.resolve(aiServicePath) : path.join(__dirname, '..', '..', '..', 'aiService.js');
  const { handleAIChat } = require(resolvedPath);

  return asyncHandler(async (req, res) => {
    console.log('\n[STAGE 1: Chat request received] Controller invoked for POST /api/chat');
    console.log('Method:', req.method, 'URL:', req.originalUrl);
    console.log('Headers:', req.headers['content-type']);
    console.log('Payload Body:', JSON.stringify(req.body, null, 2));

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      console.error('[Chat Controller Error] Invalid payload: messages must be an array.');
      return res.status(400).json({ error: 'Invalid payload: messages must be an array.' });
    }

    try {
      const reply = await handleAIChat(messages);
      console.log('[Chat Controller Response Output]:', reply.slice(0, 100) + '...');
      res.json({ reply });
    } catch (err) {
      console.error('=== CHAT CONTROLLER EXCEPTION ===');
      console.error('Stack:', err.stack);
      console.error('Message:', err.message);
      console.error('=================================');
      
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });
}

module.exports = { createChatController };
