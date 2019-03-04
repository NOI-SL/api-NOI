const admin = require('firebase-admin');
const Logger = require('../utils/logger');
const serviceAccount = require('../firebase-key');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
})

const createUsername = async function (firstName, lastName) {
    const ufn = firstName.replace(/[^a-zA-Z:]/g, '').toLowerCase();
    const lfn = lastName.replace(/[^a-zA-Z:]/g, '').toLowerCase();
    const usersRef = admin.firestore().collection('users');
    let randomizer = parseInt(Math.random() * 100);
    let tries = 0;
    while (true) {
        const query = usersRef.where('username', '==', `${ufn}.${lfn}${randomizer}`);
        const data = await query.get();
        if (data.empty) break;
        if (tries > 10) {
            randomizer = Date.now();
            break;
        }
        randomizer = parseInt(Math.random() * 100);
        tries++;
    }
    return `${ufn}.${lfn}${randomizer}`;
}

const userMailExists = async function (email) {
    // TODO implement this
    const usersRef = admin.firestore().collection('users');
    const user = await usersRef.doc(email).get();
    if (user.exists) return true;
    return false;
}

const createUserRecord = async function (inputs) {
    Logger.log('Uploading document');
    const documentUrl = await uploadDocument(inputs.document.path, `${inputs.email}/${inputs.document.originalname}`);

    Logger.log('Inserting user records into firestore');
    const userRecord = {
        username: inputs.username,
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        fullName: inputs.fullName,
        dob: inputs.dob,
        gender: inputs.gender,
        schoolName: inputs.schoolName,
        address: inputs.address,
        email: inputs.email,
        contactNumber: inputs.contactNumber,
        documentType: inputs.documentType,
        documentNumber: inputs.documentNumber,
        documentUrl: documentUrl,
        createdAt: Date.now(),
    };
    const usersRef = admin.firestore().collection('users');
    await usersRef.doc(inputs.email).set(userRecord);
    Logger.log('User record', userRecord);
}

const uploadDocument = async function (localPath, remotePath) {
    const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const res = await bucket.upload(localPath, {
        destination: remotePath,
    });
    const file = res[0];
    return file.getSignedUrl({action:'read', expires: '01.07.2020'});
}

module.exports = {
    createUsername,
    createUserRecord,
    userMailExists,
}