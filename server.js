require('dotenv').load();

var express = require('express');
var bodyParser = require('body-parser');
var verify = require('./security');
var request = require('request');
var app = express();

app.use(bodyParser.json({
  verify: verify
}));

var port = process.env.PORT || 8888;
app.set('port', port);

//require('./db');
require('./app')(app);

// 1075190579246309
// 1075190579246309
// 1075190579246309
// Listen on the specified port
app.listen(port, function() {
  console.log('Client server listening on port ' + port);
  //greetingText();
  //followUp();
});

app.get('/facebook/receive', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});


app.post('/facebook/receive', (req, res) => {
console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
          followUp(event);   
                 
        }
      });
    });
    res.status(200).end();
  }
});

function followUp(event) {
 console.log("cba");
 let sender = event.sender.id;

 request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.FB_ACCESS_TOKEN}, /********* */
    method: 'POST',
    json: {
      recipient: {id: sender},
      message:{text:"This is a follow-up message"},
      tag:"ISSUE_RESOLUTION"
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

//1482231988523798

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;  

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.FB_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: sender}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

function getTags(event) {
  let sender = event.sender.id;
  let text = event.message.text;  

  request({
    url: 'https://graph.facebook.com/v2.6/page_message_tags',
    qs: {access_token: process.env.FB_ACCESS_TOKEN},
    method: 'GET',
    json: {
      recipient: {id: sender},
      message: {text: sender}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

/*
function greetingText1(event) {
 let greetingText = "Hello, I am Muvy Chatbot."; 
 let sender = event.sender.id;
 let text = event.message.text;
 console.log("abc");

 request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    //EAAVYnwdT98YBAM9nYXkELlPlM1tAszeZB60eRBZAU1Q7hCSV1UHjo52NUvLIrQ9Iba9OlxPIuNGqZAEJJvxtrIM05ULQzNotFZAG26hEPhe8oGy38HEoVxasBOofsQTCFJMW5SnWehQ08YWMfsNjDTt5akBytmV1ZCZAj49J1WgwZDZD
    qs: {access_token: process.env.FB_ACCESS_TOKEN}, /********* 
    method: 'POST',
    json: {
      //get_started:{payload:"<GET_STARTED_PAYLOAD>"},
      //greeting:[{locale:"default", text:greetingText}],
      recipient:{id:sender},
      message:{text:"hey"},
      buttons:[{type:"postback",title:"Get started!",payload:"get started"}]
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
 */

  //"https://graph.facebook.com/v2.6/me/thread_settings?access_token=PAGE_ACCESS_TOKEN"

function greetingText() {
 let greetingText = "Hello, I am Muvy Chatbot."; 
 console.log("abc");

 request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    //EAAVYnwdT98YBAM9nYXkELlPlM1tAszeZB60eRBZAU1Q7hCSV1UHjo52NUvLIrQ9Iba9OlxPIuNGqZAEJJvxtrIM05ULQzNotFZAG26hEPhe8oGy38HEoVxasBOofsQTCFJMW5SnWehQ08YWMfsNjDTt5akBytmV1ZCZAj49J1WgwZDZD
    qs: {access_token: process.env.FB_ACCESS_TOKEN}, /********* */
    method: 'POST',
    json: {
      setting_type:"greeting",
      greeting:[
      {
        "locale":"default",
        "text":"Hello, I'm Muvy Chatbot and I can recommend movies in theaters right now. " +
              "Please ask for the menu to learn more about the choices I can offer."
      }]
      /*get_started:{payload:"<GET_STARTED_PAYLOAD>"},
      greeting:[{locale:"default", text:greetingText}],      */

    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
 
}



