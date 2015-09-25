/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var sqlite3 = require('sqlite3').verbose();

var excelParser = require('/src/parseExcel.coffee')

var staticExts = ['css','js','html','htm','png','gif','json']
// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/querydiag', function(){

})

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('yemr server listening on port ' + app.get('port'));
});
