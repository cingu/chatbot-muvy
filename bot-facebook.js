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

var Botkit = require('botkit');
var db = require("./db");

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
});

var bot = controller.spawn();
var city, genre = "", genre_2, genre_3, aaa, aaa_2, aaa_3 = "";
var top_3, aleatoire, todo_por_ti, city, emptyTodo = false;
//check if Watson's reply is 'values' for db-query
var reply = "";
//split Watson's 'values'-reply
var values = "";
//movies already recommended
var recommended = [];
//message composition for line break
var messageComposition = "";
var allMatched = 10;
var noOfRecommended = 0;
var todoPorTiMovies = [];
var request = "";

controller.hears('(.*)', 'message_received', function(bot, message) {
  reply = message.watsonData.output.text;      

   if (message.watsonError) {
      console.log(message.watsonError);
      bot.replyWithTyping(message, "I'm sorry, but for technical reasons I can't respond to your message");

   } else if(check(reply)) {                     
      var splitValues = values.split(", ");      
      var parameterArray = setValues(splitValues);                  
      var dbValues = "";              
      
      if(top_3 == true || aleatoire == true){
        randomTop(parameterArray);
      } else if ((todo_por_ti == true) || (city == true && top_3 == false && aleatoire == false)){
        //console.log("in"+ todo_por_ti+ "----"+city);
        console.log(request+"---"+parameterArray);
        console.log(typeof request);
        console.log(typeof parameterArray);        
        console.log(request===parameterArray);
        console.log(request!==parameterArray);
        //String(request)!==String(parameterArray)
        if(request==""){                              
          innerFunction(parameterArray);
        } else if(request==String(parameterArray)){
            todoPorTi(parameterArray);
        } else if(request!=String(parameterArray)){            
            innerFunction(parameterArray);
        }        
      }      

   } else if(!check(reply)) { 
      if(lineBreakMessage(reply)){
        console.log(messageComposition);
        bot.replyWithTyping(message, messageComposition);  
      } else {bot.replyWithTyping(message, reply.join('\n'));  }
  }

  function innerFunction(parameterArray){    
    request = parameterArray;
    todoPorTiMovies.length = 0;    
    console.log("inner"+ parameterArray);    
    
    db.todoPorTi(parameterArray)
      .then(()=>{        
        var dbValues = db.getResultArray();                 
        //dbValues = db.removeDuplicates(theDbValues);         
        console.log(dbValues);

        if (dbValues.length==0){          
            bot.replyWithTyping(message, "Unfortunately, it seems like I don't have any movies fitting your criterias. "+
                              "You can make a new request and provide me other criterias to work with - "+
                              "or perhaps you'd like a random suggestion?");      
        } else if(dbValues.length==1){
            var movie = getMovieInfo(dbValues,0);          
            bot.replyWithTyping(message, movie[1]);          
        } else if (dbValues.length>1) {
            todoPorTiMovies = dbValues;          
            var last = todoPorTiMovies.length-1;             
            var movie = getMovieInfo(todoPorTiMovies,last);          
            todoPorTiMovies.pop();
            var recommendedCheck = movie[0]; 

            if(todoPorTiMovies.length==0){
              emptyTodo = true;
            }                   

            if(recommendedCheck==false){
              bot.replyWithTyping(message, movie[1]);
            } else {
              todoPorTi();
            }
        } 
        
        if(genre!=""){          
          var lastGenre = lastGenreParam(message, genre);
          console.log(lastGenre);
          console.log(genre);
          db.checkAndUpdateUserGenre(lastGenre)
          .then(()=>{           
          }).catch((error) => { `Completed with error ${JSON.stringify(error)}` }); 
        } else{console.log("2"+lastGenre);console.log("2"+genre);}

      }).catch((error) => { `Completed with error ${JSON.stringify(error)}` });           
  }

  function todoPorTi(parameterArray){   
    //console.log(todoPorTiMovies.length);        
    if (todoPorTiMovies.length>0) {       
      var last = todoPorTiMovies.length-1;
      var movie = getMovieInfo(todoPorTiMovies,last);
      todoPorTiMovies.pop();
      var recommendedCheck = movie[0];

      if(todoPorTiMovies.length==0){
        emptyTodo = true;
      }

      if(recommendedCheck==false){
        bot.replyWithTyping(message, movie[1]);
      } else {
        todoPorTi();
      }
    } else if (todoPorTiMovies.length==0 || emptyTodo==true){       
      emptyTodo = false; 
      bot.replyWithTyping(message, "Slightly embarassing but I've run out of movies that fit your criterias. "+
                          "Perhaps you'd like to make another request and provide me new criterias.\n");   
    } else if (noOfRecommended==allMatched){
        noOfRecommended = 0;
        bot.replyWithTyping(message, "Slightly embarassing but I've run out of movies. "+
                            "Sadly, there wasn't anything for your taste? "+
                            "If you would like to reconsider and make another request then feel free to do so.\n");
    }  
  } 

  function randomTop(parameterArray){    
    db.queryCollection(parameterArray)
    .then(() => {               
      dbValues = db.getResultArray(); 
      console.log("lengthy " +dbValues.length);     
      //console.log(message.user);                 
              
        if(dbValues.length==3 && top_3==true){                         
          var top3Reply = getTop3(dbValues);
          bot.replyWithTyping(message, top3Reply[0]);
          bot.replyWithTyping(message, top3Reply[1]);
          bot.replyWithTyping(message, top3Reply[2]);                                    
        } else if(dbValues.length == 0) {
          bot.replyWithTyping(message, "I'm sorry but apparently I couldn't find movies matching your criterias."+
                              "\nPerhaps you could change genre or actor and I'll search anew? "+ 
                              "Which hopefully will give better results than this.");  
        } else if (noOfRecommended==allMatched) {
          var movie = getMovieInfo(dbValues,0);
          noOfRecommended = 0;
          recommended.length = [];
          bot.replyWithTyping(message, "Slightly embarassing but I've run out of movies. "+
                              "So here's another movie you've already been recommended - "+
                              "perhaps you'll reconsider? \n");
          bot.replyWithTyping(message, movie[1]);  
        } else if(dbValues.length<3){                          
          var movie = getMovieInfo(dbValues,0);
          var recommendedCheck = movie[0];          

          if(recommendedCheck==false){
            bot.replyWithTyping(message, movie[1]);
          } else if (recommendedCheck==true && aleatoire==true){
            aleatoire = false;
            randomTop();
            console.log("getting new movie");                
          } 
        }      
    }).catch((error) => { `Completed with error ${JSON.stringify(error)}` });           
  }    
});

function lastGenreParam(message,genre){
  console.log("genre"+typeof genre);
  console.log("genre"+String(genre)!="");
  console.log("genre"+String(genre)=="");
  //if(String(genre)!=""){
    var lastGenre = {"id": message.user,"genre":String(genre)};
    return lastGenre;
  //} else {return false;}
}

function getTop3(dbValues){  
  var top3Reply = [];  
  var movie, movie_2, movie_3, resume, resume_2, resume_3, score, score_2, score_3, 
         genre, genre_2, genre_3, link, link_2, link_3, checkGenre, checkGenre_2, checkGenre_3 = "";
  
  movie = String(dbValues[0].movie);
  resume = String(dbValues[0].resume);
  score = String(dbValues[0].score);
  link = String(dbValues[0].link);
  checkGenre = dbValues[0].genre;
  genre = getGenre(checkGenre);

  movie_2 = String(dbValues[1].movie);
  resume_2 = String(dbValues[1].resume);
  score_2 = String(dbValues[1].score);
  link_2 = String(dbValues[1].link);
  checkGenre_2 = dbValues[1].genre;
  genre_2 = getGenre(checkGenre_2);

  movie_3 = String(dbValues[2].movie);
  resume_3 = String(dbValues[2].resume);
  score_3 = String(dbValues[2].score);
  link_3 = String(dbValues[2].link);
  checkGenre_3 = dbValues[2].genre;
  genre_3 = getGenre(checkGenre_3);

  var replyString = "*"+movie+"*" + "\n\n" + "*Resume:* " + resume + "\n\n" + "*Genre:* " + genre + "\n\n" +
                        "*Score (IMDb):* " + score + "\n\n" + "*Read more and book tickets here:* " + link + "\n\n\n";
     
  var replyString_2 = "*"+movie_2+"*" + "\n\n" + "*Resume:* " + resume_2 + "\n\n" + "*Genre:* " + genre_2 + "\n\n" +
                        "*Score (IMDb):* " + score_2 + "\n\n" + "*Read more and book tickets here:* " + link_2 + "\n\n\n";

  var replyString_3 = "*"+movie_3+"*" + "\n\n" + "*Resume:* " + resume_3 + "\n\n" + "*Genre:* " + genre_3 + "\n\n" +
                        "*Score (IMDb):* " + score_3 + "\n\n" + "*Read more and book tickets her:* " + link_3 + "\n\n\n"                     
  
  top3Reply.push(replyString);
  top3Reply.push(replyString_2);
  top3Reply.push(replyString_3);

  addToRecommended(movie);
  addToRecommended(movie_2);
  addToRecommended(movie_3);  

  return top3Reply;  
}

function getMovieInfo(dbValues, index){    
  var returnArray = [];
  var movie, resume, score, genre, actor, link, checkGenre, checkActor = "";
  //console.log("længde"+dbValues.length);
  movie = String(dbValues[index].movie);            
  resume = String(dbValues[index].resume);  
  link = String(dbValues[index].link);            
  checkActor = dbValues[index].starring;
  checkGenre = dbValues[index].genre;            
  actors = getActors(checkActor);
  genre = getGenre(checkGenre);             
  
  var replyString = "*"+movie+"*" + "\n\n" + "*Resume:* " + resume + "\n\n" + "*Genre:* " + genre + "\n\n" +
                        "*Starring:* " + actors + "\n\n" + "*Read more and book tickets here:* " + link + "\n\n\n";
    
  var recommendedCheck = addToRecommended(movie);
  returnArray.push(recommendedCheck);
  returnArray.push(replyString);

  return returnArray;  
}

function getGenre(checkGenre){
  var genres = "";

  for (i=0; i<checkGenre.length; i++){
    genres += String(checkGenre[i].genre) + " ";    
  }
  return genres;
}

function getActors(checkActors){
  var actors = "";

  for (i=0; i<checkActors.length; i++){
    actors += String(checkActors[i].actor) + ", ";    
  }
    
  return actors.substr(0, actors.length-2);
}

function check(reply){    
  var message = String(reply[0]);  
  if(message.includes("=")){ 
      var splitMessage = message.split("= ");      
      var valuesCheck = String(splitMessage[0]);             
      var check = "values ";

      if(valuesCheck.includes("values")){
          values = splitMessage[1];
          return true;
      }
  } else {
      return false;
  }
}

function lineBreakMessage(reply){
  var message = connectReplies(reply);
  //console.log(message);
  messageComposition = "";   
  if(message.includes("&&")){
    var splitMessage = message.split("&&");   
    //console.log(splitMessage.length);
    for(i=0;i<splitMessage.length;i++){
      messageComposition += splitMessage[i] + "\n\n";
    }
    return true;
  } else { return false;}
}

function connectReplies(reply){
  var connectedReplies = "";
  for(i=0;i<reply.length;i++){
    connectedReplies += String(reply[i]) + " &&";
  }

  return connectedReplies;
}

function setValues(arr){
  var parameterArray = [];    
  top_3 = aleatoire = city = todo_por_ti = false;  

  for (i=0; i<arr.length; i++){
    var value = String(arr[i]); 
    var keyValue = value.split(":");
  
    if (String(keyValue[0])=="city"){
      //city = keyValue[1];
      city = true;
      parameterArray.push("city:"+keyValue[1]);      
    } else if (String(keyValue[0])=="genre"){
      genre = keyValue[1];
      todo_por_ti = true;
      parameterArray.push("genre:"+keyValue[1]);
    } else if (String(keyValue[0])=="genre_2"){
      //genre_2 = keyValue[1];
      parameterArray.push("genre_2:"+keyValue[1]);
    } else if (String(keyValue[0])=="genre_3"){
      //genre_3 = keyValue[1];
      parameterArray.push("genre_3:"+keyValue[1]);
    } else if (String(keyValue[0])=="aaa"){
      //aaa = keyValue[1];
      todo_por_ti = true;
      parameterArray.push("aaa:"+keyValue[1]);
    } else if (String(keyValue[0])=="aaa_2"){
      //aaa_2 = keyValue[1];      
      parameterArray.push("aaa_2:"+keyValue[1]);
    } else if (String(keyValue[0])=="aaa_3"){
      //aaa_3 = keyValue[1];
      parameterArray.push("aaa_3:"+keyValue[1]);
    } else if (String(keyValue[1])=="top 3"){
      top_3 = true;
      parameterArray.push("top_3:"+keyValue[1]);     
    } else if (String(keyValue[1])=="aleatoire"){
      aleatoire = true;
      parameterArray.push("aleatoire:"+keyValue[1]);
    } else if (String(keyValue[0])=="undefined"){
      i++;  
    }  
  }    
  return parameterArray;
}

function addToRecommended(movie){
  var contains = false;

  if(recommended.length==0){
    recommended.push(movie);
    //console.log("was empty");
  } else {
    for(i=0;i<recommended.length;i++){
      if(recommended[i]==movie){
        contains = true;
      } 
    } if(contains==false){
      recommended.push(movie);
      noOfRecommended++;
      //console.log(noOfRecommended);
    }
  }  
  return contains;
}

module.exports.controller = controller;
module.exports.bot = bot;
