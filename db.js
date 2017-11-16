"use strict";
var documentClient = require("documentdb").DocumentClient;
var config = require("./config");
var url = require('url');
var db = {};

var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${config.database.id}`;
var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;
//var collUrl = "https://muvy-chatbot.documents.azure.com/dbs/"+config.database.id+"/colls/"+config.collection.id;
var resultArray = [];
var top_3, aleatoire = false;  
var countDBElements;  

db.queryCollection = function queryCollection(parameterArray) {
    //console.log(`Querying collection through index:\n${config.collection.id}`); 
    var query = setupQuery(parameterArray);   
    //console.log(query);
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

db.getResultArray = function getResultArray(){
    return resultArray;         
}

function setupQuery(parameterArray){
    var countGenre, countAaa = 0;    
    var query = {
        query: '',
        parameters: []     
    };    
        
    var returnArray = getParameters(parameterArray);    
    query.query = returnArray[1];    
    query.parameters = returnArray[0];
    
    return query;
}

function getParameters(parameterArray){    
    var parameters = [];
    var countGenre, countAaa = 0;   
    var query, city, genre, genre_2, genre_3, aaa, aaa_2, aaa_3;
    var returnArray = [];    

   // getCountOfDBElements();
    for (var i=0; i<=parameterArray.length; i++){
        var textParam = String(parameterArray[i]);
        
        if (textParam.includes("city")){            
            var placeholder = textParam.split(":");            
            city = {name: '@city', value:placeholder[1]};
            parameters.push(city);
        } else if (textParam.includes("genre")){            
            var placeholder = textParam.split(":");
            genre = {name: '@genre', value:placeholder[1]};
            parameters.push(genre);
            countGenre++;
        } else if (textParam.includes("genre_2")){            
            var placeholder = textParam.split(":");
            genre_2 = {name: '@genre_2', value:placeholder[1]};
            parameters.push(genre_2);
            countGenre++;
        } else if (textParam.includes("genre_3")){            
            var placeholder = textParam.split(":");
            genre_3 = {name: '@genre_3', value:placeholder[1]};
            parameters.push(genre_3);
            countGenre++;
        } else if (textParam.includes("aaa")){            
            var placeholder = textParam.split(":");
            aaa = {name: '@aaa', value:placeholder[1]};
            parameters.push(aaa);
            countAaa++;
        } else if (textParam.includes("aaa_2")){            
            var placeholder = textParam.split(":");
            aaa_2 = {name: '@aaa_2', value:placeholder[1]};
            parameters.push(aaa_2);
            countAaa++;
        } else if (textParam.includes("aaa_3")){            
            var placeholder = textParam.split(":");
            aaa_3 = {name: '@aaa_3', value:placeholder[1]};
            parameters.push(aaa_3);
            countAaa++;
        } else if (textParam.includes("top_3")){            
            top_3 = true;
        } else if (textParam.includes("aleatoire")){            
            aleatoire = true;
        }
    }

    if (countAaa>0 || countGenre>0){
        query = getQuery(countAaa, countGenre); 
        returnArray.push(parameters); 
        returnArray.push(query);                               
    } else if (top_3 == true){
        query = getTop3Query();   
        returnArray.push(parameters); 
        returnArray.push(query);                
    } else if (aleatoire == true){               
        //var countQuery = "SELECT COUNT(m.id) FROM Movies m"; 
        var getRandomId, randomId, countElements;                   
        getRandomId = String(Math.floor(Math.random() * 11) + 0); 
        randomId = {name: '@id', value:getRandomId};
        parameters.push(randomId); 
        //console.log("the param "+parameters);
        returnArray.push(parameters);
        //console.log("param " + returnArray);  
        query = getRandomQuery();
        returnArray.push(query);
    }
    return returnArray;
}

function getTop3Query(){
    var query = "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                "FROM Movies m JOIN city IN m.city "+ 
                "WHERE city.city = @city ORDER BY m.score DESC";
    var query1 = "SELECT * "+
                "FROM Movies m JOIN city IN m.city "+ 
                "WHERE city.city = @city ORDER BY m.score DESC";
    return query;    
}

function getTop3Query1(){
    var query = "SELECT TOP 1 * "+
                "FROM Movies m "+ 
                "ORDER BY m.score DESC";

                //"SELECT * "+
                //"FROM Movies m JOIN city IN m.city "+ 
                //"WHERE city.city = @city "
    return query;    
}

function getRandomQuery(){
    var query = "SELECT m.movie, m.starring, m.resume, m.genre, m.score, city.city, city.link "+
                "FROM Movies m JOIN city IN m.city "+ 
                "WHERE city.city = @city AND m.id = @id";
    return query;
}

function getQuery(countAaa, countGenre){
    var query = "SELECT m.movie FROM Movies m JOIN starring IN m.starring WHERE starring.actor = @aaa AND starring.actor = @aaa_2 ";

    /*if(countGenre=3){
        var text = "m.genre"
    }*/

    return query;
}

function exit(message) {
    console.log(message);
    console.log('Press any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

//var abc = ["city:odense","aleatoire:aleatoire"];
var abc = ["city:odense","top_3:top_3"];
var query = "SELECT COUNT(m.id) FROM Movies m"; 
//queryCollection(query);
/*db.queryCollection(abc) 
.then(() => {
    var t = db.getResultArray(); 
    console.log(t);
    console.log(t[0].movie);
    console.log(t[0].genre[0]);
    console.log(t[0].score);
})
/*.then(() => { var t = db.getResultArray(); console.log("working "+t)})
.then(() => { exit(`Completed successfully`); });*/
//.catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });

//db.getResultArray();

//.then(() => { exit(`Completed successfully`); })
//.catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });

//IKKE BRUGT
db.addToArray = function addToArray(theArr){
    var arr = theArr;
    return arr;    
}
//IKKE BRUGT
db.allTogether = function allTogether(query){
    db.queryCollection(query)
    .then(() => { db.getResultArray(); })
    .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });
}

//IKKE BRUGT
function getCountOfDBElements() {
    var query = "SELECT COUNT(m.id) FROM Movies m"; 
    //return new Promise((resolve, reject) => {   
        client.queryDocuments(
            collectionUrl,
            query
        ).toArray((err, results) => {
            if (err) 
        //    reject(err)
            console.log(err);
            else {                                  
                for (var queryResult of results) {                
                    countDBElements = queryResult.$1;                                                                      
                }                            
      //          resolve(results);
            }
        });             
    //});    
}; 

module.exports = db;
