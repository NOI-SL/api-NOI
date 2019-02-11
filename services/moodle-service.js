const request = require('request-promise-native');
const Logger = require('../utils/logger');

const createMoodleUser = async function (firstName, lastName, email, username) {
  try {
    const userData = {
      createpassword: 1,
      username,
      firstname: firstName,
      lastname: lastName,
      email,
    };

    const requestParams = {
      rejectUnauthorized: false,
      method: 'POST',
      json: true,
      form: {
        wstoken: process.env.MOODLE_TOKEN,
        wsfunction: 'core_user_create_users',
        moodlewsrestformat: 'json',
        users: [
          userData,
        ],
      }
    }
    const response = await request(process.env.MOODLE_SERVICE_ENDPOINT, requestParams);

    // moodle user creation issue handler
    if (response.errorcode) {
      throw new Error(response.message);
    }
  } catch (error) {
    Logger.log('Moodle account creation failed', error);
    throw new Error('Moodle user account creation failed');
  }
}

module.exports = {
  createMoodleUser,
}
