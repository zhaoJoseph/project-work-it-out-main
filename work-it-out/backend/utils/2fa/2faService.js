require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const service = process.env.TWILIO_SERVICE;
const client = require('twilio')(accountSid, authToken);


exports.send = async (phoneNumber) => {
    return client.verify.v2.services(service)
            .verifications
            .create({to : phoneNumber, channel : 'sms'})
            .then(verificationCheck => {
                return verificationCheck.status;
            })
            .catch(err => {
                return err;
            })
}

exports.verify = async (phoneNumber, code) => {
    return client.verify.v2.services(service)
            .verificationChecks
            .create({to : phoneNumber, code : code})
            .then(verificationCheck => {
                return verificationCheck.status;
            })
            .catch(err => {
                return err;
            })
}