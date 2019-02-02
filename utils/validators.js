const request = require('request-promise-native');

const goodString = function (string) {
    return (typeof string === 'string' && string.trim().length > 0);
}

const validateRecaptchaToken = async function (token) {
    const response = await request('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST', 
        form: {
            secret: process.env.GOOGLE_RECAPTCHA_SECRET,
            response: token,
        }
    });
    console.log('Recaptcha response', response);
    return response.success;
}

module.exports = {
    goodString,
    validateRecaptchaToken
}