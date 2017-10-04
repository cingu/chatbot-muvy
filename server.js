require('dotenv').load();

var express = require('express');
var bodyParser = require('body-parser');
var verify = require('./security');
var app = express();

app.use(bodyParser.json({
  verify: verify
}));

var port = process.env.PORT || 8888;
app.set('port', port);

require('./app')(app);
//require('./test');
//console.log(process.env.FB_ACCESS_TOKEN);

// Listen on the specified port
app.listen(port, function() {
  console.log('Client server listening on port ' + port);
});