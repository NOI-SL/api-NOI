const request = require('request-promise-native');
const Logger = require('./logger');

const goodString = function (string) {
    return (typeof string === 'string' && string.trim().length > 0);
}

const validateRecaptchaToken = async function (token) {
    const response = JSON.parse(await request('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        form: {
            secret: process.env.GOOGLE_RECAPTCHA_SECRET,
            response: token,
        }
    }));
    Logger.log('Recaptcha response', response);
    return response.success;
}

module.exports = {
    goodString,
    validateRecaptchaToken
}