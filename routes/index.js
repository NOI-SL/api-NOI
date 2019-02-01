const os = require('os');
const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 1024 * 1024 * 5 } });

const validators = require('../utils/validators');
const moodleService = require('../services/moodle-service');
const dataService = require('../services/data-service');

router.post('/signup', upload.single('file_document'), function (req, res) {
  const inputs = {
    firstName: req.body['first_name'],
    lastName: req.body['last_name'],
    fullName: req.body['full_name'],
    dob: new Date(`${req.body['dob_year']}.${req.body['dob_month']}.${req.body['dob_day']}`),
    gender: req.body['gender'],
    schoolName: req.body['school_name'],
    address: [
      req.body['address_1'],
      req.body['address_2'],
    ],
    email: req.body['email'],
    contactNumber: req.body['contact_number'],
    documentType: req.body['document_type'],
    documentNumber: req.body['document_number'],
    document: req.file,
  };

  const inputErrors = [];

  if (!validators.goodString(inputs.firstName)) inputErrors.push('Invalid First Name');
  if (!validators.goodString(inputs.lastName)) inputErrors.push('Invalid Last Name');
  if (!validators.goodString(inputs.fullName)) inputErrors.push('Invalid Full Name');

  if (!inputs.dob) inputErrors.push('Invalid birthdate');
  else {
    const deadline = new Date('1999-07-01');
    if (inputs.dob < deadline) inputErrors.push('Unfortunately, you are overage to take part in NOI competition');
  }

  if (!validators.goodString(inputs.gender)) inputErrors.push('Invalid gender');
  if (!validators.goodString(inputs.schoolName)) inputErrors.push('Invalid school name');
  if (!inputs.address.length || !validators.goodString(inputs.address[0])) inputErrors.push('Invalid address');
  if (!validators.goodString(inputs.email)) inputErrors.push('Invalid email address');
  if (!validators.goodString(inputs.contactNumber)) inputErrors.push('Invalid contact number');
  if (!validators.goodString(inputs.documentType)) inputErrors.push('Invalid proof document type');
  else {
    if (inputs.documentType !== 'Letter' && !validators.goodString(documentNumber)) inputErrors.push('Invalid proof document no.');
  }

  if (!inputs.document) inputErrors.push('Invalid proof document');

  if (inputErrors.length > 0) {
    res.json({
      statusCode: 400,
      message: 'Invalid input data provided',
      errors: inputErrors,
    });
    return;
  }
  dataService.userMailExists(inputs.email)
    .then((result) => {
      if (result) throw { message: 'Email is already on the system. Please log into the NOI portal through portal.noi.lk', statusCode: 400 };
      return moodleService.createMoodleUser(inputs.firstName, inputs.lastName, inputs.email);
    })
    .then(() => {
       // TODO write the dataset into mysql or somewhere
      return true;
    })
    .then(() => {
      res.json({
        statusCode: 200,
        message: 'NOI Registration successful.',
        errors: [],
      });
    })
    .catch((error) => {
      if (error.statusCode) { // managed error
        res.json({
          statusCode: error.statusCode,
          message: error.message,
          errors: [error.message],
        });
      } else {
        res.json({
          statusCode: 500,
          message: 'Internal server error',
          errors: ['Unexpected error occurred. Please try again.']
        });
      }
    })
});

// error handler for the routes here
router.use(function (err, req, res, next) {
  if (err) {
    res.json({
      statusCode: 500,
      message: 'Internal Server Error',
      errors: ['Unexpected error occurred. Please try again.']
    });
  }
});


module.exports = router;
