var express = require('express');
var router = express.Router();
var http = require('http');
var moodle_client = require("moodle-client");

// localhost:3000/api/v1/signup
// {
// 	"firstname":"Udesh",
// 	"lastname":"euo",
// 	"fullname":"utoeuuhto",
// 	"dob": "29/01/2019",
// 	"gender": "m",
// 	"school": "Dharmaraja college kandy",
// 	"email": "uu@uu.lk",
// 	"addressline1": "34",
// 	"addressline2": "34",
// 	"contact": "0772843687",
// 	"id_type": "nic",
// 	"id": 94334
// }

router.get('/', function (req, res, next) {
  res.send("Hello");
});

router.post('/signup', function (req, res) {
  console.log(req.body);
  var data = req.body;
  var userstocreate = [{
    username: data.username,
    createpassword: 1,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email
  }];
  moodleSignUp(userstocreate).then(info => {
    res.send(info);
  });
});

function moodleSignUp(user) {
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

}

module.exports = router;
