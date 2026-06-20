// utils/email.js
// إرسال إيميلات عبر SendGrid أو Nodemailer (مع Gmail SMTP)

const functions = require("firebase-functions");

// خيار 1: SendGrid (موصى به للإنتاج)
async function sendViaSendGrid({ to, subject, html }) {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(functions.config().sendgrid.key);
  await sgMail.send({
    to,
    from: "noreply@jhome.sd",
    subject,
    html
  });
}

// خيار 2: Nodemailer مع Gmail (للتطوير والاختبار)
async function sendViaGmail({ to, subject, html }) {
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: functions.config().gmail.email,
      pass: functions.config().gmail.password  // App Password
    }
  });
  await transporter.sendMail({
    to,
    from: '"Jhome" <noreply@jhome.sd>',
    subject,
    html
  });
}

exports.sendEmail = async function sendEmail({ to, subject, html }) {
  try {
    if (functions.config().sendgrid?.key) {
      await sendViaSendGrid({ to, subject, html });
    } else if (functions.config().gmail?.email) {
      await sendViaGmail({ to, subject, html });
    } else {
      console.log("📧 [DEV] Email would be sent:", { to, subject });
    }
  } catch (err) {
    console.error("sendEmail error:", err);
  }
};