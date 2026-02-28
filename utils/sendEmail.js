const { Resend } = require('resend');

const sendEmail = async (options) => {
    try {
        console.log("Attempting to load RESEND_API_KEY:", typeof process.env.RESEND_API_KEY, `"${process.env.RESEND_API_KEY}"`);
        const apiKey = process.env.RESEND_API_KEY || "re_jHbyi2JP_FNgroyAKiJnywd7WoCThVPuY";
        const resend = new Resend(apiKey);
        // Fallback to onboarding@resend.dev if a verified domain isn't available during testing
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
            from: `Otis Temple System <${fromEmail}>`,
            to: [options.email],
            subject: options.subject,
            html: options.html,
        });

        if (error) {
            console.error('Error sending email via Resend API:', JSON.stringify(error));
            return false;
        }

        console.log(`Email sent to ${options.email}. Resend ID: ${data.id}`);
        return true;
    } catch (err) {
        console.error('Unexpected error sending email via Resend:', err.message);
        return false;
    }
};

module.exports = sendEmail;
