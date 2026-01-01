
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Quick health endpoint to verify email infrastructure
router.get('/health', (req, res) => {
    const hasSmtpHost = Boolean(process.env.SMTP_HOST);
    const hasService = Boolean(process.env.EMAIL_SERVICE || 'gmail');
    const hasSender = Boolean(process.env.SMTP_USER || process.env.EMAIL_USER);
    const hasPass = Boolean(process.env.SMTP_PASS || process.env.EMAIL_PASS);
    const ready = (hasSmtpHost || hasService) && hasSender && hasPass;
    res.json({
        ok: ready,
        using: hasSmtpHost ? 'smtp' : 'service',
        service: hasSmtpHost ? null : (process.env.EMAIL_SERVICE || 'gmail'),
        hasSender,
        hasPass,
    });
});

router.post('/', async (req, res) => {
    const { name, email, subject, category, message } = req.body || {};

    // Basic request validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields (name, email, subject, message) are required.' });
    }

    // Email config validation
        const SMTP_HOST = process.env.SMTP_HOST;
        const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
        const SMTP_SECURE = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || SMTP_PORT === 465;
        const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
        const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
        const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

        if (!SMTP_USER || !SMTP_PASS) {
            return res.status(503).json({ error: 'Email service not configured. Missing SMTP/EMAIL credentials.' });
        }

    try {
            const transporter = SMTP_HOST
                ? nodemailer.createTransport({
                        host: SMTP_HOST,
                        port: SMTP_PORT,
                        secure: SMTP_SECURE,
                        auth: { user: SMTP_USER, pass: SMTP_PASS },
                    })
                : nodemailer.createTransport({
                        service: EMAIL_SERVICE,
                        auth: { user: SMTP_USER, pass: SMTP_PASS },
                    });

        // Verify transporter (will catch auth issues early)
        try {
            await transporter.verify();
        } catch (verifyErr) {
            console.error('Nodemailer verify failed:', verifyErr?.message || verifyErr);
            return res.status(500).json({ error: 'Email transport verification failed.' });
        }

        const mailOptions = {
            from: SMTP_USER,
            replyTo: email,
            to: process.env.EMAIL_RECEIVER || SMTP_USER,
            subject: `${category || 'general'} - ${subject}`,
            html: `
                <h3>PrepEdge AI : New Message Received</h3>
                <hr />
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/</g, '&lt;')}</p>
                <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        const code = error?.code || '';
        const isAuth = /auth|credentials|invalid login/i.test(error?.message || '') || code === 'EAUTH';
        const isNetwork = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(error?.message || '');
        console.error('Contact form email failed:', error?.message || error);
        if (isAuth) {
            return res.status(500).json({ error: 'Email authentication failed. Check EMAIL_USER/EMAIL_PASS.' });
        }
        if (isNetwork) {
            return res.status(502).json({ error: 'Email network error. Try again later.' });
        }
        return res.status(500).json({ error: 'Failed to send message.' });
    }
});

export default router;
