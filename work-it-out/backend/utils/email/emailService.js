const nodemailer = require("nodemailer")
const handlebars = require("handlebars")
const { setTimeout } = require("timers/promises");
const { google, gmail_v1 } = require("googleapis");
const fs = require("fs")
const path = require("path")
require('dotenv').config()


const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token : process.env.REFRESH_TOKEN });
const gmail = google.gmail({version : 'v1', auth : oAuth2Client});

const parseMessage = async (message) => {

    const messageId = message.data.messages[0].id;

    const replymessage = await gmail.users.messages.get({
        userId : 'me',
        id : messageId
    });

    return replymessage.data.snippet;
}


async function checkDelivered (email) {

    await setTimeout(5000);

    const minuteAgoEpoch = Math.round(new Date()/ 1000) - 60;

    const message = await gmail.users.messages.list({
        userId : 'me',
        q: `from:mailer-daemon@googlemail.com AND after:${minuteAgoEpoch}`,
        maxResults: 1,
      });
    
    if(!message.data.messages) {
        return;
    }

    const messageThread = await parseMessage(message);

   if((messageThread.includes(`${email}`))) {
    throw new Error('Email was not delivered!');
   }
}

exports.send = async (toEmail, subject, data, templateName) => {
    try {

        const accessToken = await oAuth2Client.getAccessToken();

        const client = nodemailer.createTransport({
            name:  'gmail',
            service: 'gmail',
            sendMail : true,
            auth: {
                type: 'OAUTH2',
                user: process.env.EMAIL_HOST_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret : process.env.CLIENT_SECRET,
                refreshToken : process.env.REFRESH_TOKEN,
                accessToken : accessToken
            },
            logger: true,
            debug: true
        })

        const template = fs.readFileSync(path.join(__dirname, `./templates/${templateName}.handlebars`), "utf8")
        const email = handlebars.compile(template)

        await client.sendMail({
                from: process.env.EMAIL_HOST_USER,
                to: toEmail,
                subject: subject,
                html: email(data),
            }, (err, info) => (err, info) => err? err : console.log(info));

        await checkDelivered(toEmail);

    } catch (err) {
        console.log('There was an error sending the email!', err)
        throw new Error(err);
    }
}