const request = require('request-promise-native');

const createMoodleUser = async function (firstName, lastName, email) {
  try {
    const ufn = firstName.replace(/[^a-zA-Z:]/g, '').toLowerCase();
    const lfn = lastName.replace(/[^a-zA-Z:]/g, '').toLowerCase();
    const username = `${ufn}.${lfn}${parseInt(Math.random() * 100)}`;

    const userData = {
      createpassword: 1,
      username,
      firstname: firstName,
      lastname: lastName,
      email,
    };

    console.log('Creating moodle user with parameters', userData);
    const requestParams = {
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
    console.log('Could not create user account on moodle', error);
    throw new Error('Moodle user account creation failed');
  }
}

module.exports = {
  createMoodleUser,
}
