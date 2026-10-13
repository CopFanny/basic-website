// Simple Express contact form backend
// Expects SMTP configuration via environment variables.

const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4123;

app.use(cors());
app.use(bodyParser.json());

// Basic rate limiter to slow down spam
const limiter = rateLimit({ windowMs: 60 * 1000, max: 6 });
app.use('/api/contact', limiter);

function createTransport(){
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if(!host || !port){
    console.warn('SMTP not configured — falling back to log-only mode. Set SMTP_HOST/SMTP_PORT to enable emails.');
    return null;
  }

  return nodemailer.createTransport({ host, port: Number(port), secure: Number(port) === 465, auth: user ? { user, pass } : undefined });
}

const transporter = createTransport();

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if(!name || !email || !message) return res.status(400).json({ error: 'Please provide name, email, and message.' });

  const text = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

  if(!transporter){
    // If no SMTP configured, log to console for development
    console.log('Contact form submission (no SMTP):\n', text);
    return res.json({ ok: true, info: 'logged' });
  }

  try{
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `contact@${process.env.SMTP_HOST || 'example.com'}`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Website contact from ${name}`,
      text,
      replyTo: email,
    });

    console.log('Email sent', info && info.messageId);
    return res.json({ ok: true });
  } catch(err){
    console.error('Error sending email', err);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => console.log(`Contact API listening on port ${PORT}`));
