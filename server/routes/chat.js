const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Bot automated response knowledge engine
function getAutomatedBotReply(messageText) {
  const text = messageText.toLowerCase();
  const settings = db.getSiteSettings();

  if (text.includes('bkash') || text.includes('nagad') || text.includes('rocket') || text.includes('payment') || text.includes('taka') || text.includes('trx')) {
    return `💳 **Payment Instructions & Numbers:**
- **bKash**: \`${settings.bkash_number}\`
- **Nagad**: \`${settings.nagad_number}\`
- **Rocket**: \`${settings.rocket_number}\`
- **Cash on Delivery**: Available across Bangladesh!

👉 **How to Pay:**
1. Send Money / Payment to our number.
2. Copy the **TrxID (Transaction ID)** from your SMS or app.
3. Enter your Sender Number & TrxID on the checkout page to place the order!`;
  }

  if (text.includes('delivery') || text.includes('charge') || text.includes('fee') || text.includes('koto din') || text.includes('time')) {
    return `🚚 **Delivery Information & Charges:**
- **Inside Dhaka**: ৳${settings.dhaka_delivery_fee} (Fast delivery in 24 - 48 Hours)
- **Outside Dhaka**: ৳${settings.outside_dhaka_delivery_fee} (Delivered within 2 - 4 Days)
- **Free Delivery**: On all orders over ৳${settings.free_delivery_threshold}!

All orders are tracked real-time through our courier network.`;
  }

  if (text.includes('track') || text.includes('order status') || text.includes('kothay') || text.includes('status')) {
    return `📦 **Order Tracking:**
You can view real-time status of your orders from your **User Dashboard -> My Orders** tab, or check the status update timeline instantly. If you need special dispatch, let our admin team know right here!`;
  }

  if (text.includes('return') || text.includes('refund') || text.includes('warranty') || text.includes('damage')) {
    return `🛡️ **Warranty & 7-Day Return Policy:**
- We offer **7-Day Instant Replacement** if any product is found defective or damaged upon arrival.
- All electronics & gadgets come with 1 to 2 Years Official Brand Warranty.
- Keep your Invoice and original packaging intact for easy warranty claims.`;
  }

  if (text.includes('human') || text.includes('admin') || text.includes('kotha') || text.includes('agent') || text.includes('help') || text.includes('hello') || text.includes('hi')) {
    return `👋 Thank you for reaching out! Our Support Admin team is online. Please leave your specific question or Order ID, and a live agent will assist you here shortly.`;
  }

  // Default fallback smart response
  return `🤖 We have received your message! An Admin support representative has been notified and will reply shortly. You can also tap one of the quick options below for instant answers.`;
}

// GET CONVERSATION HISTORY
router.get('/:convId', (req, res) => {
  try {
    const { convId } = req.params;
    const conv = db.getConversation(convId);
    return res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('Error fetching conversation:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching chat.' });
  }
});

// USER SENDS A MESSAGE (triggers auto-bot response & real-time socket)
router.post('/:convId/send', (req, res) => {
  try {
    const { convId } = req.params;
    const { text, userId, userName, userPhone, userEmail, wantsBotReply = true } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const { conv, message: userMsg } = db.addChatMessage(convId, {
      sender: 'user',
      text: text.trim(),
      userId,
      userName: userName || 'Guest User'
    });

    if (userPhone && !conv.user_phone) conv.user_phone = userPhone;
    if (userEmail && !conv.user_email) conv.user_email = userEmail;
    db.save();

    // Broadcast user message to admin
    const io = req.app.get('io');
    if (io) {
      io.emit('chat_message_received', { convId, message: userMsg, conversation: conv });
    }

    // Process automated bot response if desired
    let botReplyMsg = null;
    if (wantsBotReply) {
      const autoReplyText = getAutomatedBotReply(text.trim());
      const botResult = db.addChatMessage(convId, {
        sender: 'bot',
        text: autoReplyText,
        userId: null,
        userName: 'Nexus Assistant (Auto)',
        isBot: true
      });
      botReplyMsg = botResult.message;

      if (io) {
        // slight delay to feel natural
        setTimeout(() => {
          io.emit('chat_message_received', { convId, message: botReplyMsg, conversation: conv });
        }, 500);
      }
    }

    return res.json({
      success: true,
      userMessage: userMsg,
      botReply: botReplyMsg,
      conversation: conv
    });
  } catch (err) {
    console.error('Error sending user message:', err);
    return res.status(500).json({ success: false, message: 'Server error sending message.' });
  }
});

// ADMIN: GET ALL CONVERSATIONS LIST
router.get('/admin/all', requireAdmin, (req, res) => {
  try {
    const conversations = db.getConversations();
    return res.json({ success: true, conversations });
  } catch (err) {
    console.error('Error getting admin chat list:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching chats.' });
  }
});

// ADMIN: REPLY TO USER
router.post('/admin/:convId/reply', requireAdmin, (req, res) => {
  try {
    const { convId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty.' });
    }

    const { conv, message: adminMsg } = db.addChatMessage(convId, {
      sender: 'admin',
      text: text.trim(),
      userId: req.user.id,
      userName: req.user.name + ' (Admin Support)',
      isBot: false
    });

    conv.unread_admin_count = 0; // cleared by admin reading/replying
    db.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('chat_message_received', { convId, message: adminMsg, conversation: conv });
    }

    return res.json({
      success: true,
      message: 'Admin message sent!',
      adminMessage: adminMsg,
      conversation: conv
    });
  } catch (err) {
    console.error('Error sending admin reply:', err);
    return res.status(500).json({ success: false, message: 'Server error sending reply.' });
  }
});

module.exports = router;
