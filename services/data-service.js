const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,

});
let connected = false;

connection.connect((err) => {
    if(err) {
        console.log('Could not connect to MYSQL database', err);
        return;
    }
    connected = true;
});

const userMailExists = async function (email) {
    // TODO implement this
    
    // if(!connected) throw new Error('App is not connected to MYSQL database');
    return false;
}

const createUserRecord = async function (inputs) {
    if(!connected) throw new Error('App is not connected to MYSQL database');
    // TODO store the basic data on DB
    // TODO upload the image to somewhere
}

module.exports = {
    createUserRecord,
    userMailExists,
}