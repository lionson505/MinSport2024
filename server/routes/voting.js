// Import nodemailer for sending emails
const nodemailer = require('nodemailer');

// Endpoint to send email for voting results
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    // Validate input
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, message' 
      });
    }
    
    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      text: message,
      html: `<div>${message}</div>`,
    });
    
    console.log('Email sent: %s', info.messageId);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message
    });
  }
}); 