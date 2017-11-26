"use strict";
var documentClient = require("documentdb").DocumentClient;
var config = require("./config");
var url = require('url');
var db = {};

var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${config.database.id}`;
var collectionUrl = `${databaseUrl}/colls/${config.collection.movies}`;
var collectionUrlGenre = `${databaseUrl}/colls/${config.collection.usersGenre}`;
var resultArray = [], todoArray = [], userArray = [];
var top_3, aleatoire = false;  
var idOfDBElements = [];  
var failedUpdate = false;


function insertDocument(document) {
    let documentUrl = `${collectionUrlGenre}/docs/${document.id}`;
    //console.log(`Getting document:\n${document.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, { partitionKey: document.district }, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrlGenre, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

function updateDocument(document) {
    let documentUrl = `${collectionUrlGenre}/docs/${document.id}`;
    console.log(`Replacing document:\n${document.genre}\n`);
    //document.children[0].grade = 6;

    return new Promise((resolve, reject) => {
        client.replaceDocument(documentUrl, document, (err, result) => {
            if (err) {
                failedUpdate=true;
                reject(err);                 
            }
            else {
                resolve(result);
            }
        });
    });
};

db.queryCollection = function queryCollection(parameterArray) {
    //console.log(`Querying collection through index:\n${config.collection.id}`);     
    var query = setupQuery(parameterArray);       
    return new Promise((resolve, reject) => {   
        client.queryDocuments(
            collectionUrl,
            query
        ).toArray((err, results) => {
            if (err) 
            reject(err)
            else { 
                resultArray.length = 0;
                 
                for (var queryResult of results) {
                    //let resultString = JSON.stringify(queryResult);                    
                    //var resultString = JSON.stringify(queryResult);
                    //console.log("\tQuery returned "+resultString);                    
                    resultArray.push(queryResult);                                                 
                }              
                if(top_3==true){
                    resultArray.length = 3;
                    top_3 = false;
                }
                resolve(results);
            }
        });             
    });  
};

function getTodoPorTiMovies(query) {    
    return new Promise((resolve, reject) => {   
        client.queryDocuments(
            collectionUrl,
            query
        ).toArray((err, results) => {
            if (err) 
            reject(err)
            else {                
                resultArray.length = 0; 
                for (var queryResult of results) {                                       
                    resultArray.push(queryResult);                                                 
                }                          
                resolve(results);
            }
        });             
    });  
};

function userCheck(query) {   
    //var query = "SELECT u.id FROM UsersGenre u";  
    return new Promise((resolve, reject) => {   
        client.queryDocuments(
            collectionUrlGenre,
            query
        ).toArray((err, results) => {
            if (err) 
            reject(err)
            else {                
                userArray.length = 0; 
                for (var queryResult of results) { 
                    let resultString = JSON.stringify(queryResult);                                        
                    userArray.push(resultString);                                                 
                }                          
                resolve(results);
            }
        });             
    });  
};

db.getResultArray = function getResultArray(){    
    return resultArray;         
}

function removeDuplicates(resultArray){  
  var match = {}, theResultArray = []
  for (var i=0; i<resultArray.length; i++) {
    var v = resultArray[i].movie;    
    if (!match[v]) {
      theResultArray.push(resultArray[i]);
      match[v]=true;
    }
  }
  if (theResultArray.length>0){
    return theResultArray;
  } else {
      return resultArray;
  }
}

function removeUnique(resultArray){  
  var match = {}, theResultArray = [];
  for (var i=0; i<resultArray.length; i++) {
    var v = resultArray[i].movie;
    if (!match[v]) {      
      match[v]=true;
    } else {
      theResultArray.push(resultArray[i]);
    }
  }
  if (theResultArray.length>0){
    return theResultArray;
  } else {
      return resultArray;
  }
}

function setupQuery(parameterArray){      
    var query = {
        query: '',
        parameters: []     
    };            
    var returnArray = getParameters(parameterArray);    
    query.query = returnArray[1];    
    query.parameters = returnArray[0];            
    return query;
}

function setupQuery2(theQuery, param){      
    var query = {
        query: '',
        parameters: []     
    };                     
    query.query = theQuery;    
    query.parameters = param;        
    return query;
}

function getParameters(parameterArray){        
    var parameters = [];
    var query, city;
    var returnArray = [];    
    top_3 = false; aleatoire = false;
   
    for (var i=0; i<=parameterArray.length; i++){
        var textParam = String(parameterArray[i]);
        
        if (textParam.includes("city")){            
            var placeholder = textParam.split(":");            
            city = {name: '@city', value:placeholder[1]};
            parameters.push(city);
        } else if (textParam.includes("top_3")){            
            top_3 = true;
        } else if (textParam.includes("aleatoire")){            
            aleatoire = true;
        }
    }

    if (top_3 == true){
        query = getTop3Query();  
        returnArray.push(parameters);          
        returnArray.push(query);                
    } else if (aleatoire == true){                        
        var getRandomId, randomId, countElements;                   
        getRandomId = String(Math.floor(Math.random() * 11) + 0); 
        randomId = {name: '@id', value:getRandomId};
        parameters.push(randomId);                
        query = getRandomQuery();
        returnArray.push(parameters); 
        returnArray.push(query);
    }
    return returnArray;
}

function getParameters2(parameterArray){              
    var countGenre = 0;   
    var countAaa = 0; 
    var parameters = [];
    var query, city, genre, genre_2, genre_3, aaa, aaa_2, aaa_3;
    var returnArray = [];      
      
    for (var i=0; i<=parameterArray.length; i++){
        var textParam = String(parameterArray[i]);        
        var placeholder = textParam.split(":");        
        
        if (placeholder[0].includes("city")){            
            city = {name: '@city', value:placeholder[1]};
            parameters.push(city);
        } else if (placeholder[0]=="genre"){                        
            genre = {name: '@genre', value:placeholder[1]};
            parameters.push(genre);
            countGenre++;            
        } else if (placeholder[0].includes("genre_2")){                        
            genre_2 = {name: '@genre_2', value:placeholder[1]};
            parameters.push(genre_2);
            countGenre++;
        } else if (placeholder[0].includes("genre_3")){                        
            genre_3 = {name: '@genre_3', value:placeholder[1]};
            parameters.push(genre_3);
            countGenre++;
        } else if (placeholder[0]=="aaa"){                        
            aaa = {name: '@aaa', value:placeholder[1]};
            parameters.push(aaa);
            countAaa++;
        } else if (placeholder[0].includes("aaa_2")){                        
            aaa_2 = {name: '@aaa_2', value:placeholder[1]};
            parameters.push(aaa_2);
            countAaa++;
        } else if (placeholder[0].includes("aaa_3")){                        
            aaa_3 = {name: '@aaa_3', value:placeholder[1]};
            parameters.push(aaa_3);
            countAaa++;
        }
    }

    returnArray.push(parameters);
    returnArray.push(countAaa);
    returnArray.push(countGenre);    

    return returnArray;             
}

db.todoPorTi = function todoPorTi(parameterArray){
    return new Promise(function(resolve, reject) {          
        var returnArray = getParameters2(parameterArray);        
        var queries = getTodoPorTiQuery(returnArray[1], returnArray[2]);                    
        var mainQuery = queries;            
        var param = returnArray[0];
        var main = setupQuery2(mainQuery,param);  
        //console.log("das MAIN query "+main.query);       
       // console.log("das MAIN query "+main.parameters[0].value);
        //console.log("das MAIN query "+main.parameters[1].value);
        //console.log("das MAIN query "+main.parameters[2].value);
        getTodoPorTiMovies(main)
        .then(()=>{             
            resultArray = removeDuplicates(resultArray);                       
            resolve();                
        })      
        .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });                                       
    });   
}

function getTop3Query(){
    var query = "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                "FROM Movies m JOIN city IN m.city "+ 
                "WHERE city.city = @city ORDER BY m.score DESC";    
    return query;    
}

function getRandomQuery(){
    var query = "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                "FROM Movies m JOIN city IN m.city "+ 
                "WHERE city.city = @city AND m.id = @id";
    return query;
}

function getCityQuery(){
    var query = "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                "FROM Movies m JOIN city IN m.city WHERE city.city = @city ";
    return query;
}

function getTodoPorTiQuery(countAaa, countGenre){    
    var main =  "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                "FROM Movies m JOIN city IN m.city JOIN genre IN m.genre JOIN starring IN m.starring "+
                "WHERE (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa) ";                        

    if(countAaa==0 && countGenre==0){
        main = getCityQuery();        
        return main;  

    } else if((countAaa==1 && countGenre==0)||(countAaa==0 && countGenre==1)){
        if(countGenre==0){
            main =  "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                    "FROM Movies m JOIN city IN m.city JOIN starring IN m.starring "+
                    "WHERE city.city = @city AND starring.actor = @aaa ";                 
        } else if(countAaa==0){
            main =  "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                    "FROM Movies m JOIN city IN m.city JOIN genre IN m.genre "+
                    "WHERE city.city = @city AND genre.genre = @genre ";   
        }                
        return main;
        
    } else if(countAaa==1 && countGenre==1){                
        //main += "OR (city.city = @city AND starring.actor = @aaa) OR (city.city = @city AND genre.genre = @genre) ";         
        return main;
        
    } else if(countAaa==1 && countGenre==2){                      
        main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                //"OR (city.city = @city AND genre.genre = @genre) "+
                //"OR (city.city = @city AND genre.genre = @genre_2) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa) ";         
        return main;        

    } else if(countAaa==1 && countGenre==3){
        main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                //"OR (city.city = @city AND genre.genre = @genre) "+
                //"OR (city.city = @city AND genre.genre = @genre_2) "+
                //"OR (city.city = @city AND genre.genre = @genre_3) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa) "+
                "OR (city.city = @city AND genre.genre = @genre_3 AND starring.actor = @aaa) ";         
        return main;    

    } else if((countAaa==2 && countGenre==0)||(countAaa==0 && countGenre==2)){
        if(countGenre==0){
            main =  "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                    "FROM Movies m JOIN city IN m.city JOIN starring IN m.starring "+
                    "WHERE (city.city = @city AND starring.actor = @aaa) OR "+
                    "(city.city = @city AND starring.actor = @aaa_2) ";                 
        } else if(countAaa==0){
            main =  "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                    "FROM Movies m JOIN city IN m.city JOIN genre IN m.genre "+
                    "WHERE (city.city = @city AND genre.genre = @genre) OR "+
                    "(city.city = @city AND genre.genre = @genre_2) ";
        }            
        return main;

    } else if(countAaa==2 && countGenre==1){
        main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                //"OR (city.city = @city AND starring.actor = @aaa_2) "+
                //"OR (city.city = @city AND genre.genre = @genre) "+                           
                "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_2) ";        
        return main; 

    } else if(countAaa==2 && countGenre==2){
        main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                //"OR (city.city = @city AND starring.actor = @aaa_2) "+
                //"OR (city.city = @city AND genre.genre = @genre) "+
                //"OR (city.city = @city AND genre.genre = @genre_2) "+                
                "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_2) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa_2) ";                        
        return main; 

    } else if(countAaa==2 && countGenre==3){
        main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                //"OR (city.city = @city AND starring.actor = @aaa_2) "+
                //"OR (city.city = @city AND genre.genre = @genre) "+
                //"OR (city.city = @city AND genre.genre = @genre_2) "+
                //"OR (city.city = @city AND genre.genre = @genre_3) "+
                "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_2) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa_2) "+                
                "OR (city.city = @city AND genre.genre = @genre_3 AND starring.actor = @aaa) "+ 
                "OR (city.city = @city AND genre.genre = @genre_3 AND starring.actor = @aaa_2) ";         
        return main; 

    } else if((countAaa==3 && countGenre==0)||(countAaa==0 && countGenre==3)){
        if(countGenre==0){
            main = "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                   "FROM Movies m JOIN city IN m.city JOIN starring IN m.starring "+
                   "WHERE (city.city = @city AND starring.actor = @aaa) OR "+
                   "(city.city = @city AND starring.actor = @aaa_2) OR "+
                   "(city.city = @city AND starring.actor = @aaa_3) ";                 
        } else if(countAaa==0){
            main =  "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                    "FROM Movies m JOIN city IN m.city JOIN genre IN m.genre "+
                    "WHERE (city.city = @city AND genre.genre = @genre) OR "+
                    "(city.city = @city AND genre.genre = @genre_2) OR "+
                    "(city.city = @city AND genre.genre = @genre_3) ";
        }            
        return main;

    } else if(countAaa==3 && countGenre==1){
         main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                 //"OR (city.city = @city AND starring.actor = @aaa_2) "+
                 //"OR (city.city = @city AND starring.actor = @aaa_3) "+
                 //"OR (city.city = @city AND genre.genre = @genre) "+                
                 "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_2) "+
                 "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_3) ";                              
        return main; 

    } else if(countAaa==3 && countGenre==2){
        main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                //"OR (city.city = @city AND starring.actor = @aaa_2) "+
                //"OR (city.city = @city AND starring.actor = @aaa_3) "+
                //"OR (city.city = @city AND genre.genre = @genre) "+
                //"OR (city.city = @city AND genre.genre = @genre_2) "+
                "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_2) "+
                "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_3) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa_2) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa_3) ";                    
        return main; 

    } else if(countAaa==3 && countGenre==3){
        main += //"OR (city.city = @city AND starring.actor = @aaa) "+
                //"OR (city.city = @city AND starring.actor = @aaa_2) "+
                //"OR (city.city = @city AND starring.actor = @aaa_3) "+
                //"OR (city.city = @city AND genre.genre = @genre) "+
                //"OR (city.city = @city AND genre.genre = @genre_2) "+
                //"OR (city.city = @city AND genre.genre = @genre_3) "+
                "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_2) "+
                "OR (city.city = @city AND genre.genre = @genre AND starring.actor = @aaa_3) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa_2) "+
                "OR (city.city = @city AND genre.genre = @genre_2 AND starring.actor = @aaa_3) "+                
                "OR (city.city = @city AND genre.genre = @genre_3 AND starring.actor = @aaa) "+ 
                "OR (city.city = @city AND genre.genre = @genre_3 AND starring.actor = @aaa_2) "+
                "OR (city.city = @city AND genre.genre = @genre_3 AND starring.actor = @aaa_3) ";        
        return main; 
    }         
}

db.checkAndUpdateUserGenre = function checkAndUpdateUserGenre(doc){
    var userId = doc.id;    
    var query = {
        query: 'SELECT u.id FROM UsersGenre u WHERE u.id = @id',   
        parameters: [{name:'@id',value:userId}]     
    };
    
    return new Promise(function(resolve, reject) {  
        userCheck(query)
        .then(()=>{    
            if(userArray.length==0){
                insertDocument(doc)
                .then(()=>{
                    console.log("inserted");                    
                }).catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) }); 
            } else if(userArray.length>0){
                updateDocument(doc)
                .then(()=>{
                    console.log("updated");                    
                }).catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) }); 
            } resolve();            
        }).catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) }); 
    });
}

function exit(message) {
    console.log(message);
    console.log('Press any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

var abc1 = ["city:odense","aleatoire:aleatoire"];
var abc = ["city:odense","genre:drama","aaa:ryan gosling"];
var a = ["city:odense"];
var b = ["genre:action"];
var c = ["aaa:Gal Gadot"];
var query = "SELECT COUNT(m.id) FROM Movies m";
var doc = {
    "id": "3",
    "user":"test",
    "genre":"drama"
};


//db.checkAndUpdateUserGenre(doc);
/*.then(()=>{
    console.log("done");
}).catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) }); 

//queryCollection(query);
/*db.queryCollection(abc1) 
.then(() => {
    var t = db.getResultArray(); 
    console.log(t);
    console.log(t[0].movie);
    console.log(t[0].genre[0]);
    console.log(t[0].score);
 
})
/*.then(() => { exit(`Completed successfully`); });*/
//.catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) }); 
//var qwe = setupQuery2(city, param);
//console.log(qwe);
/*db.todoPorTi(abc)
.then(() =>{
    console.log("heress");
   var t = db.getResultArray(); 
    //console.log("lengthy "+t.length);
    //console.log(t);
    //var x = removeUnique(t);
    
    var y = db.removeDuplicates(t);
    console.log(y);
    /*console.log(t[0].movie);
    console.log(t[0].genre[0]);
    console.log(t[0].score);*/
//})
//.catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) }); 

module.exports = db;
