/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('dotenv').config();
var request = require('request');

var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  url: /*process.env.CONVERSATION_URL ||*/ 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
  //https://gateway.watsonplatform.net/conversation/api
});

module.exports = function(app) {
  /*if (process.env.USE_SLACK) {
    var Slack = require('./bot-slack');
    Slack.controller.middleware.receive.use(middleware.receive);
    Slack.bot.startRTM();
    console.log('Slack bot is live');
  }*/
  //if (process.env.USE_FACEBOOK) {

    //greetingText;
    //test();

    var Facebook = require('./bot-facebook');
    Facebook.controller.middleware.receive.use(middleware.receive);
    Facebook.controller.createWebhookEndpoints(app, Facebook.bot);
    console.log('Facebook bot is live');
 //}
  /*if (process.env.USE_TWILIO) {
    var Twilio = require('./bot-twilio');
    Twilio.controller.middleware.receive.use(middleware.receive);
    Twilio.controller.createWebhookEndpoints(app, Twilio.bot);
    console.log('Twilio bot is live');
  }*/
  // Customize your Watson Middleware object's before and after callbacks.
  middleware.before = function(message, conversationPayload, callback) {    
    callback(null, conversationPayload);
  }

  middleware.after = function(message, conversationResponse, callback) {    
    callback(null, conversationResponse);
  }
};

/*
function test(){
  request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    //EAAVYnwdT98YBAM9nYXkELlPlM1tAszeZB60eRBZAU1Q7hCSV1UHjo52NUvLIrQ9Iba9OlxPIuNGqZAEJJvxtrIM05ULQzNotFZAG26hEPhe8oGy38HEoVxasBOofsQTCFJMW5SnWehQ08YWMfsNjDTt5akBytmV1ZCZAj49J1WgwZDZD
    qs: {access_token: process.env.FB_ACCESS_TOKEN}, /**********/
  /*  method: 'DELETE',
    json: { 
      fields:["get_started"]//:{payload:"<GET_STARTED_PAYLOAD>"
    }
    /*{
      get_started:{payload:"<GET_STARTED_PAYLOAD>"},
      //greeting:[{locale:"default", text:greetingText}],
      //buttons:[{type:"postback",title:"Get started!",payload:"get started"}]
    }*/
 /* }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });

}


module.exports.greetingText = function greetingText() {
 let greetingText = "Hello, I am Muvy Chatbot. If you want movies to be recommended then let's get started!"; 
 
 request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    //EAAVYnwdT98YBAM9nYXkELlPlM1tAszeZB60eRBZAU1Q7hCSV1UHjo52NUvLIrQ9Iba9OlxPIuNGqZAEJJvxtrIM05ULQzNotFZAG26hEPhe8oGy38HEoVxasBOofsQTCFJMW5SnWehQ08YWMfsNjDTt5akBytmV1ZCZAj49J1WgwZDZD
    qs: {access_token: process.env.FB_ACCESS_TOKEN}, /********* */
 /*   method: 'POST',
    json: {
      //get_started:{payload:"<GET_STARTED_PAYLOAD>"},
      greeting:[{locale:"default", text:greetingText}],
      buttons:[{type:"postback",title:"Get started!",payload:"get started"}]
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
 
}*/