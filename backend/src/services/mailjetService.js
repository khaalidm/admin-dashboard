const mailjet = require('node-mailjet').apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

const sendEmail = async (to, subject, text) => {
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'khaalidm.m@gmail.com',
                        Name: 'NA'
                    },
                    To: [
                        {
                            Email: to,
                            Name: 'NA'
                        }
                    ],
                    Subject: subject,
                    TextPart: text
                }
            ]
        });
        const response = await request;
        return response.body;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Failed to send email');
    }
};

module.exports = {
    sendEmail
};