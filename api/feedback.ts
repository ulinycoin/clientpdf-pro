import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { rating, comment, email, supportId, tool } = req.body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.error('Missing Telegram configuration');
        return res.status(500).json({ error: 'Feedback system not configured' });
    }

    const emojiRating = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][rating - 1] || rating;

    const message = `
🌟 *New Feedback Received*

*Rating:* ${emojiRating}
*Tool:* ${tool || 'N/A'}
*Comment:* ${comment || 'No comment'}
*Email:* ${email || 'Anonymous'}
*Support ID:* \`${supportId}\`
  `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.description || 'Telegram API error');
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Error sending feedback to Telegram:', error);
        return res.status(500).json({ error: 'Failed to send feedback' });
    }
}
