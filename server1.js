const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 8888, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get("/", function (request, response) {
  var user_name = request.query.user_name;
  response.end("Hello " + user_name + "!");
});

/* For Facebook Validation */
app.get('/facebook/receive', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/facebook/receive', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

require('dotenv').config();

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    //EAAVYnwdT98YBAM9nYXkELlPlM1tAszeZB60eRBZAU1Q7hCSV1UHjo52NUvLIrQ9Iba9OlxPIuNGqZAEJJvxtrIM05ULQzNotFZAG26hEPhe8oGy38HEoVxasBOofsQTCFJMW5SnWehQ08YWMfsNjDTt5akBytmV1ZCZAj49J1WgwZDZD
    //muvy-chatbot: EAACLoZAZAbqY8BADmZBvfZAcZBiPDQkDYSmdOfKsLFmKBkiCkxqFR62CQUaFibskDPRbiZCQCp2ZAAAn4FEQGNBGCyW82hGn4sYLvpiC2gi9xV4jEgZAp8AamXCO3OjZBYoPviJ2xE6k0KAaXjQZA2oaHPcoj4SpPfwRx2ve9R86kZBDwZDZD
    qs: {access_token: process.env.FB_ACCESS_TOKEN}, /********* */
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: text}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}