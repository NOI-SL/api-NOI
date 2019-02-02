const os = require('os');
const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 1024 * 1024 * 5 } });

const validators = require('../utils/validators');
const moodleService = require('../services/moodle-service');
const dataService = require('../services/data-service');


router.post('/signup', upload.single('file_document'), (req, res) => {
  const inputErrors = [];
  let inputs;
  try {
    console.log('Parsing sign up request');

    inputs = {
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
      recaptchaToken: req.body['recaptcha_token'],
    };

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
      if (inputs.documentType !== 'Letter' && !validators.goodString(inputs.documentNumber)) inputErrors.push('Invalid proof document no.');
    }

    if (!inputs.document) inputErrors.push('Invalid proof document');
  } catch (error) {
    console.log('Error while parsing input data', error);
    throw new Error('Error while parsing input data');
  }

  validators.validateRecaptchaToken(inputs.recaptchaToken)
    .then((valid) => {
      console.log('captcha response value', valid);
      if (!valid) inputErrors.push('Failed to validate your recaptcha token');
    })
    .then(() => {
      if (inputErrors.length > 0) {
        throw {
          statusCode: 400,
          message: 'Invalid input data provided',
          errors: inputErrors,
        };
      }
    })
    .then(() => {
      console.log('Checking email existence');
      return dataService.userMailExists(inputs.email);
    })
    .then((result) => {
      if (result) throw { message: 'Email is already on the system. Please log into the NOI portal through portal.noi.lk', statusCode: 400 };
    })
    .then(() => {
      console.log('Finding an available username');
      return dataService.createUsername(inputs.firstName, inputs.lastName);
    })
    .then((username) => {
      inputs.username = username;
    })
    .then(() => {
      console.log('Storing user data');
      return dataService.createUserRecord(inputs);
    })
    .then(() => {
      console.log('Creating Moodle user');
      return moodleService.createMoodleUser(inputs.firstName, inputs.lastName, inputs.email, inputs.username);
    })
    .then(() => {
      console.log('NOI User registration successful');
      res.status(200).json({
        statusCode: 200,
        message: 'NOI Registration successful.',
        errors: [],
      });
    })
    .catch((error) => {
      console.log('Error occurred in the process', error);
      if (error.statusCode) { // managed error
        res.status(error.statusCode).json({
          statusCode: error.statusCode,
          message: error.message,
          errors: error.errors ? error.errors : [error.message],
        });
      } else {
        res.status(500).json({
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
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      errors: ['Unexpected error occurred. Please try again.']
    });
  }
});


module.exports = router;
