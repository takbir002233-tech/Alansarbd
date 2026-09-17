const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin, requirePermission } = require('../middleware/auth');

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
router.get('/admin/all', requirePermission('chat.manage'), (req, res) => {
  try {
    const conversations = db.getConversations();
    return res.json({ success: true, conversations });
  } catch (err) {
    console.error('Error getting admin chat list:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching chats.' });
  }
});

// ADMIN: REPLY TO USER
router.post('/admin/:convId/reply', requirePermission('chat.manage'), (req, res) => {
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

// ==========================================
// ADMIN GROUP LIVE CHAT (TEAM DISCUSSION)
// ==========================================

// GET ALL ADMIN GROUP MESSAGES
router.get('/admin-group/messages', requireAdmin, (req, res) => {
  try {
    const messages = db.getAdminGroupMessages();
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching admin group messages:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching group chat.' });
  }
});

// GET ALL ADMIN TEAM MEMBERS DIRECTORY
router.get('/admin-group/members', requireAdmin, (req, res) => {
  try {
    const members = db.getAdminTeamMembers();
    return res.json({ success: true, members });
  } catch (err) {
    console.error('Error fetching admin team members:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching team members.' });
  }
});

// SEND MESSAGE TO ADMIN GROUP
router.post('/admin-group/messages', requireAdmin, (req, res) => {
  try {
    const { text, attachment } = req.body;
    if ((!text || !text.trim()) && !attachment) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const senderRole = req.user.custom_role || (req.user.role === 'admin' && !req.user.is_staff ? 'Super Admin' : 'Staff Admin');

    const newMsg = db.addAdminGroupMessage({
      sender_id: req.user.id,
      sender_name: req.user.name,
      sender_role: senderRole,
      text: (text || '').trim(),
      attachment: attachment || null
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('admin_group_message', newMsg);
    }

    return res.status(201).json({
      success: true,
      message: newMsg
    });
  } catch (err) {
    console.error('Error sending admin group message:', err);
    return res.status(500).json({ success: false, message: 'Server error sending team message.' });
  }
});

// DELETE MESSAGE IN ADMIN GROUP
router.delete('/admin-group/messages/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const messages = db.getAdminGroupMessages();
    const targetMsg = messages.find(m => m.id === id);

    if (!targetMsg) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const isOwner = targetMsg.sender_id === req.user.id;
    const isSuper = req.user.role === 'admin' && !req.user.is_staff;

    if (!isOwner && !isSuper) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages.' });
    }

    const deleted = db.deleteAdminGroupMessage(id);
    if (deleted) {
      const io = req.app.get('io');
      if (io) {
        io.to('admin_channel').emit('admin_group_message_deleted', { id });
      }
      return res.json({ success: true, message: 'Message deleted.' });
    }

    return res.status(500).json({ success: false, message: 'Could not delete message.' });
  } catch (err) {
    console.error('Error deleting admin group message:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting message.' });
  }
});

// TOGGLE PIN ANNOUNCEMENT IN ADMIN GROUP
router.post('/admin-group/messages/:id/pin', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.togglePinAdminGroupMessage(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('admin_group_message_pinned', { id, is_pinned: updated.is_pinned });
    }

    return res.json({ success: true, message: updated });
  } catch (err) {
    console.error('Error toggling pin:', err);
    return res.status(500).json({ success: false, message: 'Server error pinning message.' });
  }
});

module.exports = router;
