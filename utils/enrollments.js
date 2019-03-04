const fs = require('fs');
const moodleService = require('../services/moodle-service');
const readline = require('readline');
const logger = require('./logger');

// can be used to enroll a selected set of users in a course
// reads a file containing NOI Portal usernames of the users and enrolls them to a given course
// TO Use:
// have a file containing the usernames of the users to be enrolled, separated by new lines
// pass the courseId and the file location and call the function
function enrollUsers(usernamesFileLocation, courseId) {
    const usernames = [];
    const reader = readline.createInterface({
        input: fs.createReadStream(usernamesFileLocation)
    });
    reader.on('line', (line) => {
        usernames.push(line.trim());
    });

    reader.on('close', () => {
        moodleService.enrollUsers(usernames, courseId)
            .then(() => {
                logger.log('Users enrolled');
            })
            .catch((error) => {
                logger.error('Error occurred while enrolling users', error);
            });
    })
}

module.exports.enrollUsers = enrollUsers;