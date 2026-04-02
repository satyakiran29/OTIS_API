const https = require('https');
const http = require('http');

const startKeepAliveJob = () => {
    // Render free tier spins down web services after 15 minutes of inactivity.
    // We ping the server every 14 minutes (14 * 60 * 1000 ms) to avoid this.
    const interval = 14 * 60 * 1000;
    const url = process.env.RENDER_EXTERNAL_URL 
        ? `${process.env.RENDER_EXTERNAL_URL}/ping` 
        : `https://otis-api.onrender.com/ping`;

    setInterval(() => {
        try {
            console.log(`[Cron] Pinging ${url} to keep server alive...`);

            const lib = url.startsWith('https') ? https : http;
            lib.get(url, (res) => {
                if (res.statusCode === 200) {
                    console.log('[Cron] Keep-alive ping successful');
                } else {
                    console.log(`[Cron] Keep-alive ping failed with status code: ${res.statusCode}`);
                }
            }).on('error', (err) => {
                console.error('[Cron] Keep-alive ping error:', err.message);
            });
        } catch (error) {
            console.error('[Cron] Error in keep-alive job:', error);
        }
    }, interval);
};

module.exports = startKeepAliveJob;
