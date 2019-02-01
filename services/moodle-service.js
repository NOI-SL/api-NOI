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

/*
unction moodleSignUp(user) {
  moodle_client.init({
    wwwroot: "http://35.200.248.101",
    token: "4bf594439359bce8686deaef1cd95586"
  }).then(function (client) {
    return client.call({
      wsfunction: "core_user_create_users",
      method: "POST",
      args: {users: user}
    }).then(function (info) {
      console.log("Done");
      return info;
    }).catch(err => {
      console.log(err);
    });
  }).catch(function (err) {
    console.log("Unable to initialize the client: " + err);
  });

}*/
