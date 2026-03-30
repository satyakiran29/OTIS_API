const { OpenAI } = require('openai');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seva = require('../models/Seva');

// Helper component for local AI matching
const getMockResponse = (lowercaseMsg) => {
    if (lowercaseMsg.includes('time') || lowercaseMsg.includes('timing') || lowercaseMsg.includes('open') || lowercaseMsg.includes('close')) {
        return "The temple is open daily from 5:00 AM to 1:00 PM, and from 4:00 PM to 9:00 PM. Darshan is paused briefly during daily naivedyam offerings.";
    } else if (lowercaseMsg.includes('event') || lowercaseMsg.includes('festival') || lowercaseMsg.includes('upcoming')) {
        return "We celebrate several grand festivals! The daily Suprabhatam begins at 5 AM, our special Abhishekam is on Fridays, and the Maha Brahmotsavam is an annual 9-day celebration. Check the Events tab for exact dates!";
    } else if (lowercaseMsg.includes('seva') || lowercaseMsg.includes('pooja') || lowercaseMsg.includes('darshan') || lowercaseMsg.includes('ticket')) {
        return "You can book various spiritual sevas like special VIP Darshan, Abhishekam, and Archana. Please navigate to the Seva booking portal on our website to secure your e-tickets in advance.";
    } else if (lowercaseMsg.includes('donate') || lowercaseMsg.includes('donation') || lowercaseMsg.includes('fund')) {
        return "We deeply appreciate all contributions, which aid in temple maintenance and Nitya Annadanam (free meals). You can securely donate any amount through our unified Donations page.";
    } else {
        return "Namaskaram! 🙏 I am your Temple Assistant. I can help you with temple timings, upcoming events, sevas, and donation procedures! What would you like to know?";
    }
};

const generateChatResponse = async (userMessage) => {
    const lowercaseMsg = userMessage.toLowerCase();
    const apiKey = process.env.OPENAI_API_KEY;

    try {
        // -- OPENAI REAL ENGINE MODE --
        // Check if user set a valid api key format 
        if (apiKey && apiKey !== 'dummy_key' && apiKey.trim() !== '' && !apiKey.includes('your-actual')) {
            const openai = new OpenAI({ apiKey: apiKey });
            let contextText = '';

            // Database Context (Skipped if DB is disconnected)
            if (mongoose.connection.readyState === 1) {
                if (lowercaseMsg.includes('event') || lowercaseMsg.includes('festival') || lowercaseMsg.includes('upcoming')) {
                    const upEvents = await Event.find({}).sort({ date: 1 }).limit(3).catch(() => []);
                    if (upEvents && upEvents.length > 0) {
                        contextText += 'Upcoming Events: ' + upEvents.map(e => `${e.name} on ${new Date(e.date).toDateString()}`).join(', ') + '. ';
                    }
                }
                if (lowercaseMsg.includes('seva') || lowercaseMsg.includes('pooja') || lowercaseMsg.includes('darshan') || lowercaseMsg.includes('ticket')) {
                    const sevas = await Seva.find({}).limit(5).catch(() => []);
                    if (sevas && sevas.length > 0) {
                        contextText += 'Available Sevas: ' + sevas.map(s => `${s.name} (Rs ${s.price})`).join(', ') + '. ';
                    }
                }
            } else {
                contextText += '(Note: Realtime events are currently hidden due to local database disconnection.)';
            }

            const systemPrompt = `You are a polite, helpful Temple Assistant AI. Answer questions related to temple timings, darshan, sevas, events, and donations strictly. If the user asks something completely unrelated to temples or spirituality, gracefully decline pointing them back to temple matters. Limit your responses to short, conversational lengths. Use the following dynamic database context if relevant to the query to provide accurate times and prices: ${contextText}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 150,
                temperature: 0.7,
            });

            return completion.choices[0].message.content;
        } else {
            // -- MOCK / LOCAL ENGINE MODE (No API Key) -- 
            await new Promise(res => setTimeout(res, 900)); // Simulate AI ping delay
            return getMockResponse(lowercaseMsg);
        }

    } catch (error) {
        console.error('Error generating chat response:', error.message);
        
        // AUTO FALLBACK: If OpenAI failed because of a 429 quota exhausted error, automatically catch the error and respond realistically using the local fallback engine!
        if (error.message.includes('429') || error.message.includes('quota')) {
            return getMockResponse(lowercaseMsg);
        }

        return `I apologize, but I am currently unable to process your request. Please contact the temple office directly. (Technical Debug Error: ${error.message})`;
    }
};

module.exports = { generateChatResponse };
