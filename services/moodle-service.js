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

const getUserProfile = async function (username) {
  try {
    const requestParams = {
      rejectUnauthorized: false,
      method: 'POST',
      json: true,
      form: {
        wstoken: process.env.MOODLE_TOKEN,
        wsfunction: 'core_user_get_users',
        moodlewsrestformat: 'json',
        criteria: [
          {
            key: 'username',
            value: username,
          },
        ],
      }
    }
    const response = await request(process.env.MOODLE_SERVICE_ENDPOINT, requestParams);
    // moodle user creation issue handler
    if (response.errorcode) {
      throw new Error(response.message);
    }

    if(!response.users.length) {
      throw new Error('User does not exist');
    }

    return response.users[0];
  } catch (error) {
    console.log('Moodle action failed', error);
    throw new Error('Moodle action failed');
  }
}

const enrollUsers = async function(usernames, courseId) {
  for(let username of usernames){
    try {
      await enrollUser(username, courseId);
    } catch(error){
      console.log("Could not enroll user ", {username, error});
    }
  }
}

const enrollUser = async function (username, courseId) {
  try {

    const user = await getUserProfile(username);
    const userId = user.id;

    const requestParams = {
      rejectUnauthorized: false,
      method: 'POST',
      json: true,
      form: {
        wstoken: process.env.MOODLE_TOKEN,
        wsfunction: 'enrol_manual_enrol_users',
        moodlewsrestformat: 'json',
        enrolments: [
          {
            roleid: 5,
            userid: userId,
            courseid: courseId,
          },
        ],
      }
    }
    const response = await request(process.env.MOODLE_SERVICE_ENDPOINT, requestParams);
    // moodle user creation issue handler
    if (response && response.errorcode) {
      throw new Error(response.message);
    }

    return userId;
  } catch (error) {
    console.log('Moodle action failed', error);
    throw new Error('Moodle action failed');
  }
}

module.exports = {
  createMoodleUser,
  getUserProfile,
  enrollUser,
  enrollUsers,
}
