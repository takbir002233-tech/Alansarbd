const nodemailer = require('nodemailer');
const db = require('../db');

/**
 * Get active transporter based on database site settings or environment
 */
function getTransporter() {
  const settings = db.getSiteSettings() || {};
  const host = settings.smtp_host || process.env.SMTP_HOST || 'smtp-mail.outlook.com';
  const port = Number(settings.smtp_port || process.env.SMTP_PORT) || 587;
  const secure = port === 465;
  const user = settings.smtp_user || process.env.SMTP_USER || settings.admin_notification_email || 'alansar.bd@hotmail.com';
  const pass = settings.smtp_pass || process.env.SMTP_PASS || '';

  if (pass) {
    try {
      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });
    } catch (err) {
      console.warn('⚠️ SMTP Transporter creation warning:', err.message);
    }
  }

  // Safe fallback logger if SMTP credentials not fully provided
  return {
    sendMail: async (options) => {
      console.log(`📧 [MAIL SERVICE - SIMULATED DISPATCH]:`);
      console.log(`   To: ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   From: ${options.from}`);
      return { messageId: 'sim_' + Date.now(), accepted: [options.to] };
    }
  };
}

/**
 * Helper to get default From address and Admin notification target
 */
function getMailAddresses() {
  const settings = db.getSiteSettings() || {};
  const adminEmail = settings.admin_notification_email || 'alansar.bd@hotmail.com';
  const fromName = settings.store_name || 'AL ANSAR Luxury Super Shop';
  const fromUser = settings.smtp_user || 'alansar.bd@hotmail.com';
  const fromAddress = `"${fromName}" <${fromUser}>`;
  return { adminEmail, fromAddress, settings };
}

/**
 * Send an email safely without crashing or throwing
 */
async function sendSafeMail(mailOptions) {
  try {
    const transporter = getTransporter();
    const result = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully dispatched to ${mailOptions.to} (${mailOptions.subject})`);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Mail dispatch failed to ${mailOptions.to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate standard branded HTML wrapper for AL ANSAR
 */
function wrapHtmlContent(title, headerBadge, innerHtml, ctaText = '', ctaUrl = '') {
  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e2e8f0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 25px 20px; text-align: center; border-bottom: 2px solid #f59e0b; }
    .header-logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #f59e0b; text-transform: uppercase; margin-bottom: 6px; }
    .header-tagline { font-size: 11px; color: #94a3b8; letter-spacing: 1px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-top: 10px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .content { padding: 25px 20px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .card { background-color: #1e293b; border-radius: 12px; padding: 16px; border: 1px solid #334155; margin: 18px 0; }
    .table-data { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table-data td { padding: 8px 10px; border-bottom: 1px solid #334155; font-size: 13px; }
    .table-data tr:last-child td { border-bottom: none; }
    .table-data td.label { font-weight: bold; color: #94a3b8; width: 35%; }
    .table-data td.value { color: #f8fafc; font-weight: 600; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #d97706, #f59e0b); color: #020617 !important; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 10px; margin: 20px 0 10px 0; text-align: center; }
    .footer { background-color: #0b0f19; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
    .footer a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">AL ANSAR</div>
      <div class="header-tagline">LUXURY SUPER SHOP • ISLAMIC ETHICAL COMMERCE</div>
      ${headerBadge ? `<div class="badge">${headerBadge}</div>` : ''}
    </div>
    <div class="content">
      ${innerHtml}
      ${ctaText && ctaUrl ? `<div style="text-align: center;"><a href="${ctaUrl}" class="btn">${ctaText}</a></div>` : ''}
    </div>
    <div class="footer">
      <p style="margin: 0 0 5px 0;">© ২০২৬ AL ANSAR SUPER SHOP বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।</p>
      <p style="margin: 0;">বিলাসবহুল পারফিউম, খাঁটি আতর, ঘরের বাজার, বেকারি ও সুদমুক্ত করযে হাসানা সেবা।</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * 1. SEND REAL-TIME ADMIN ALERT EMAIL
 * Triggered on: Order arrived, Qard apply, VIP apply, Refund request, User delete/appeal
 */
async function sendAdminAlert({ type, title, message, details = {}, link = '' }) {
  const { adminEmail, fromAddress } = getMailAddresses();
  if (!adminEmail) return;

  const typeLabels = {
    order: '🛒 নতুন অর্ডার এসেছে',
    qard: '🌸 করযে হাসানা আবেদন',
    loyalty: '💎 ভিআইপি মেম্বারশিপ আবেদন',
    refund: '↩️ রিফান্ড ও রিটার্ন আবেদন',
    user_delete: '⚠️ একাউন্ট ডিলিট নোটিশ',
    appeal: '🛡️ একাউন্ট রিভিউ / আপিল'
  };

  const badgeText = typeLabels[type] || '🔔 অ্যাডমিন নোটিফিকেশন';

  let tableRows = '';
  for (const [key, val] of Object.entries(details)) {
    if (val !== undefined && val !== null && val !== '') {
      tableRows += `
        <tr>
          <td class="label">${key}</td>
          <td class="value">${val}</td>
        </tr>
      `;
    }
  }

  const innerHtml = `
    <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0; margin-bottom: 8px;">${title}</h2>
    <p style="color: #cbd5e1; margin-top: 0;">${message}</p>
    ${tableRows ? `
      <div class="card">
        <div style="font-weight: bold; color: #f59e0b; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">বিস্তারিত তথ্য বিবরণী</div>
        <table class="table-data">
          ${tableRows}
        </table>
      </div>
    ` : ''}
    <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
      সরাসরি অ্যাডমিন প্যানেল থেকে বিস্তারিত যাচাই ও ব্যবস্থা গ্রহণ করতে পারেন।
    </p>
  `;

  const html = wrapHtmlContent(title, badgeText, innerHtml, 'অ্যাডমিন প্যানেল খুলুন', link || 'https://alansarbd.com/admin');

  return sendSafeMail({
    from: fromAddress,
    to: adminEmail,
    subject: `[AL ANSAR ALERT] ${title}`,
    html
  });
}

/**
 * 2. SEND WELCOME EMAIL TO NEW USER UPON REGISTRATION
 */
async function sendWelcomeEmail(user) {
  if (!user || !user.email) return;
  const { fromAddress } = getMailAddresses();

  const innerHtml = `
    <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0;">আসসালামু আলাইকুম, ${user.name}!</h2>
    <p style="color: #cbd5e1;">
      <strong>আল আনসার সুপার শপ</strong>-এ আপনাকে আন্তরিক মোবারকবাদ। আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে।
    </p>
    <div class="card">
      <div style="font-weight: bold; color: #f59e0b; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">আপনার অ্যাকাউন্ট তথ্য</div>
      <table class="table-data">
        <tr><td class="label">নাম:</td><td class="value">${user.name}</td></tr>
        <tr><td class="label">ইমেইল:</td><td class="value">${user.email}</td></tr>
        <tr><td class="label">মোবাইল:</td><td class="value">${user.phone || 'দেওয়া হয়নি'}</td></tr>
        <tr><td class="label">ঠিকানা:</td><td class="value">${user.address || 'ঢাকা, বাংলাদেশ'}</td></tr>
      </table>
    </div>
    <div style="margin-top: 15px; color: #cbd5e1; font-size: 13px;">
      <p><strong>আমাদের বিশেষ সুবিধাসমূহ:</strong></p>
      <ul style="padding-left: 20px; line-height: 1.8; color: #94a3b8;">
        <li>✨ ১০০% খাঁটি ও অ্যালকোহলমুক্ত ফ্রেগ্রেন্স ও আতর কালেকশন</li>
        <li>🛒 অর্গানিক ঘরের বাজার ও স্বাস্থ্যসম্মত ফ্রেশ বেকারি আইটেম</li>
        <li>🤝 <strong>করযে হাসানা স্কিম</strong>: বিনা সুদে ১০% তাৎক্ষণিক হালাল ঋণ সুবিধা</li>
        <li>💎 <strong>রয়্যাল ভিআইপি মেম্বারশিপ</strong>: প্রতিটি অর্ডারে আকর্ষণীয় ক্যাশব্যাক রিওয়ার্ড পয়েন্ট</li>
      </ul>
    </div>
  `;

  const html = wrapHtmlContent('স্বাগতম আল আনসার পরিবারে', '🎉 নতুন সদস্য রেজিস্ট্রেশন', innerHtml, 'কেনাকাটা শুরু করুন', 'https://alansarbd.com');

  return sendSafeMail({
    from: fromAddress,
    to: user.email,
    subject: `আল আনসার-এ আপনাকে স্বাগতম! (Welcome to AL ANSAR)`,
    html
  });
}

/**
 * 3. SEND QARD-E-HASANA APPROVAL EMAIL
 */
async function sendQardApprovedEmail(user, application = {}) {
  const email = user?.email || application?.email;
  if (!email) return;
  const { fromAddress } = getMailAddresses();

  const limit = application.requested_limit || user?.qard_credit_limit || 10000;

  const innerHtml = `
    <h2 style="color: #10b981; font-size: 18px; margin-top: 0;">🌸 আলহামদুলিল্লাহ! আপনার করযে হাসানা আবেদন অনুমোদিত হয়েছে</h2>
    <p style="color: #cbd5e1;">
      সম্মানিত <strong>${user?.name || application?.name}</strong>, আপনার করযে হাসানা আবেদনটি যাচাই শেষে সফলভাবে অনুমোদন করা হয়েছে।
    </p>
    <div class="card" style="border-color: #059669; background: #064e3b15;">
      <div style="font-weight: bold; color: #34d399; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">অনুমোদিত সুবিধার বিবরণ</div>
      <table class="table-data">
        <tr><td class="label">অনুমোদিত ক্রেডিট লিমিট:</td><td class="value" style="color: #34d399; font-size: 16px;">৳${Number(limit).toLocaleString()}</td></tr>
        <tr><td class="label">সুদের হার:</td><td class="value" style="color: #fbbf24;">০% (সম্পূর্ণ সুদমুক্ত হালাল স্কিম)</td></tr>
        <tr><td class="label">চেকআউট সুবিধা:</td><td class="value">অর্ডারের সময় ১০% তাৎক্ষণিক বাকি সুবিধা</td></tr>
        <tr><td class="label">স্ট্যাটাস:</td><td class="value" style="color: #10b981;">সক্রিয় (Active)</td></tr>
      </table>
    </div>
    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
      এখন থেকে চেকআউটে ‘করযে হাসানা (১০% ধার)’ নির্বাচন করে কেনাকাটা করতে পারবেন। এটি একটি ঈমানী আমানত, নির্দিষ্ট মেয়াদের মধ্যে বাকি অর্থ পরিশোধ করে নিয়মিত লেনদেন বজায় রাখুন।
    </p>
  `;

  const html = wrapHtmlContent('করযে হাসানা অনুমোদিত', '🌸 করযে হাসানা অনুমোদন', innerHtml, 'আপনার পাসবুক দেখুন', 'https://alansarbd.com/qard-hasana');

  return sendSafeMail({
    from: fromAddress,
    to: email,
    subject: `🌸 অভিনন্দন! আপনার করযে হাসানা আবেদন অনুমোদিত হয়েছে (AL ANSAR)`,
    html
  });
}

/**
 * 4. SEND VIP LOYALTY CARD APPROVAL EMAIL
 */
async function sendVipApprovedEmail(user, application = {}) {
  const email = user?.email || application?.email;
  if (!email) return;
  const { fromAddress } = getMailAddresses();

  const cardNumber = user?.loyalty_card_number || 'ANSAR-VIP-' + Math.floor(1000 + Math.random() * 9000) + '-2026';

  const innerHtml = `
    <h2 style="color: #f59e0b; font-size: 18px; margin-top: 0;">💎 অভিনন্দন! আপনার আল আনসার ভিআইপি মেম্বারশিপ অনুমোদিত হয়েছে</h2>
    <p style="color: #cbd5e1;">
      সম্মানিত <strong>${user?.name || application?.name}</strong>, আল আনসার রয়্যাল ভিআইপি প্রিভিলেজ ক্লাবে আপনাকে উষ্ণ অভ্যর্থনা।
    </p>
    <div class="card" style="border-color: #d97706; background: #78350f15;">
      <div style="font-weight: bold; color: #fbbf24; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">ডিজিটাল ভিআইপি কার্ড তথ্য</div>
      <table class="table-data">
        <tr><td class="label">কার্ড নম্বর:</td><td class="value" style="color: #fbbf24; font-family: monospace; font-size: 15px;">${cardNumber}</td></tr>
        <tr><td class="label">মেম্বারশিপ টায়ার:</td><td class="value">Royal Gold VIP</td></tr>
        <tr><td class="label">প্রারম্ভিক রিওয়ার্ড পয়েন্ট:</td><td class="value" style="color: #34d399;">১০০ পয়েন্ট বোনাস</td></tr>
        <tr><td class="label">বিশেষ সুবিধা:</td><td class="value">প্রায়োরিটি কুরিয়ার ডেলিভারি ও ক্যাশব্যাক পয়েন্ট</td></tr>
      </table>
    </div>
    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
      আপনার অ্যাকাউন্ট ড্যাশবোর্ডে ডিজিটাল ভিআইপি কার্ডটি যুক্ত করা হয়েছে। যেকোনো অর্ডারে স্বয়ংক্রিয় পয়েন্ট রিওয়ার্ড ও অগ্রাধিকারমূলক সেবা উপভোগ করুন।
    </p>
  `;

  const html = wrapHtmlContent('ভিআইপি কার্ড অনুমোদিত', '💎 রয়্যাল ভিআইপি মেম্বার', innerHtml, 'আপনার ভিআইপি কার্ড দেখুন', 'https://alansarbd.com/loyalty-card');

  return sendSafeMail({
    from: fromAddress,
    to: email,
    subject: `💎 অভিনন্দন! আপনার আল আনসার ভিআইপি কার্ড অনুমোদিত হয়েছে`,
    html
  });
}

/**
 * 5. SEND REFUND APPROVAL EMAIL
 */
async function sendRefundApprovedEmail(refund) {
  if (!refund || !refund.user_email) return;
  const { fromAddress } = getMailAddresses();

  const innerHtml = `
    <h2 style="color: #10b981; font-size: 18px; margin-top: 0;">✓ আপনার রিফান্ড আবেদনটি অনুমোদিত হয়েছে</h2>
    <p style="color: #cbd5e1;">
      সম্মানিত <strong>${refund.user_name}</strong>, আপনার রিফান্ড আবেদনটি আমাদের কাস্টমার কেয়ার টিম কর্তৃক অনুমোদিত হয়েছে।
    </p>
    <div class="card">
      <div style="font-weight: bold; color: #10b981; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">রিফান্ড বিবরণী</div>
      <table class="table-data">
        <tr><td class="label">অর্ডার নম্বর:</td><td class="value">#${refund.order_code}</td></tr>
        <tr><td class="label">রিফান্ড পরিমাণ:</td><td class="value" style="color: #34d399; font-size: 15px;">৳${Number(refund.total_refund_amount).toLocaleString()}</td></tr>
        <tr><td class="label">পেমেন্ট মেথড:</td><td class="value">${(refund.preferred_method || 'bKash').toUpperCase()}</td></tr>
        <tr><td class="label">প্রাপক অ্যাকাউন্ট:</td><td class="value">${refund.payout_account || 'N/A'}</td></tr>
        ${refund.refund_trx_id ? `<tr><td class="label">ট্রানজেকশন TrxID:</td><td class="value" style="font-family: monospace;">${refund.refund_trx_id}</td></tr>` : ''}
        <tr><td class="label">স্ট্যাটাস:</td><td class="value" style="color: #10b981;">অনুমোদিত (Approved)</td></tr>
      </table>
    </div>
    <p style="font-size: 12px; color: #94a3b8;">
      যেকোনো অনুসন্ধানে আমাদের কাস্টমার সাপোর্ট হেল্পলাইনে যোগাযোগ করতে পারেন। আল আনসার-এর সাথে থাকার জন্য ধন্যবাদ।
    </p>
  `;

  const html = wrapHtmlContent('রিফান্ড অনুমোদিত', '✓ রিফান্ড অনুমোদন', innerHtml, 'অর্ডার হিস্ট্রি দেখুন', 'https://alansarbd.com/orders');

  return sendSafeMail({
    from: fromAddress,
    to: refund.user_email,
    subject: `✓ আপনার রিফান্ড আবেদন অনুমোদিত হয়েছে (অর্ডার #${refund.order_code})`,
    html
  });
}

/**
 * 6. SEND ACCOUNT APPEAL RESOLUTION EMAIL
 */
async function sendAppealApprovedEmail(appeal) {
  const email = appeal?.user_email;
  if (!email) return;
  const { fromAddress } = getMailAddresses();

  const innerHtml = `
    <h2 style="color: #10b981; font-size: 18px; margin-top: 0;">✓ আপনার অ্যাকাউন্ট আপিল পর্যালোচনা সম্পন্ন হয়েছে</h2>
    <p style="color: #cbd5e1;">
      সম্মানিত <strong>${appeal.user_name || 'গ্রাহক'}</strong>, আপনার দাখিলকৃত অ্যাকাউন্ট রিভিউ আবেদনটি পর্যালোচনা করে সমাধান করা হয়েছে।
    </p>
    <div class="card">
      <div style="font-weight: bold; color: #f59e0b; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">আপিল স্ট্যাটাস বিবরণ</div>
      <table class="table-data">
        <tr><td class="label">আপিল আইডি:</td><td class="value">#${appeal.id}</td></tr>
        <tr><td class="label">বর্তমান অবস্থা:</td><td class="value" style="color: #10b981;">সমাধানকৃত (Resolved)</td></tr>
        ${appeal.admin_reply ? `<tr><td class="label">অ্যাডমিন মন্তব্য:</td><td class="value">${appeal.admin_reply}</td></tr>` : ''}
      </table>
    </div>
    <p style="font-size: 12px; color: #94a3b8;">
      আপনার অ্যাকাউন্টটি পুনরায় সক্রিয় করা হয়েছে। এখন আপনি স্বাভাবিকভাবে আল আনসার-এ লগইন করতে পারেন।
    </p>
  `;

  const html = wrapHtmlContent('আপিল পর্যালোচনা সম্পন্ন', '🛡️ অ্যাকাউন্ট আপিল আপডেট', innerHtml, 'লগইন করুন', 'https://alansarbd.com/login');

  return sendSafeMail({
    from: fromAddress,
    to: email,
    subject: `✓ আপনার অ্যাকাউন্ট আপিল পর্যালোচনা সম্পন্ন হয়েছে (AL ANSAR)`,
    html
  });
}

module.exports = {
  sendAdminAlert,
  sendWelcomeEmail,
  sendQardApprovedEmail,
  sendVipApprovedEmail,
  sendRefundApprovedEmail,
  sendAppealApprovedEmail,
  sendSafeMail
};
