require('dotenv').config(); // Load from current directory (backend/)
const nodemailer = require('nodemailer');

const testSMTP = async () => {
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 587;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    console.log('Testing SMTP Configuration...');
    console.log(`Host: ${SMTP_HOST}`);
    console.log(`Port: ${SMTP_PORT}`);
    console.log(`User: ${SMTP_USER}`);
    console.log(`Pass: ${SMTP_PASS ? '******' : 'NOT SET'}`);

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error(' Missing one or more required environment variables.');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log(' SMTP Connection Verification Successful!');
    } catch (error) {
        console.error(' SMTP Connection Verification Failed!');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
};

testSMTP();
