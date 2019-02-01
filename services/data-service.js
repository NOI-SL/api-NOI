const userMailExists = async function (email) {
    // TODO implement this
    console.log('User email', email);
    return false;
}

const createUserRecord = async function (inputs) {
    // TODO store the basic data on DB
    // TODO upload the image to somewhere
    console.log('User Inputs', inputs);
}

module.exports = {
    createUserRecord,
    userMailExists,
}