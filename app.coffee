###*
# Module dependencies.
###
_ = require('underscore')
express = require('express')
http = require('http')
path = require('path')
app = express()
# sqlite3 = require('sqlite3').verbose()
excelParser = require('./src/parseExcel')
staticExts = ['css','js','html','htm','png','gif','jpg','jpeg','json']
# all environments
app.set 'port', process.env.PORT or 3030
app.use express.urlencoded()
app.use express.methodOverride()
app.use app.router
app.use express.static(path.join(__dirname, 'public'))

diagData = excelParser('diag.csv')
console.log(diagData.diags)

# development only
if 'development' == app.get('env')
  app.use express.errorHandler()

app.get '/querydiag', (req, res) ->
  res.json(query(req.query.keyword))

app.get '/validatediag', (req, res) ->
  userDiag = req.query.diag.trim()
  foundDiag = do ->
    for item in diagData.diags
      return item.name if userDiag is item.name
      return item.aliasFor.name if userDiag is item.aliasFor?.name
  res.json
    valid: !!foundDiag
    formalName: foundDiag

app.post '/getdiagtree', (req, res) ->
  res.json getTreeNodes(req.body.name)


server = http.createServer(app)
server.listen app.get('port'), ->
  console.log 'yemr server listening on port ' + app.get('port')
  return

query = (key) ->
  return [] if !key
  key = key.toLowerCase()
  _.chain(diagData.diags)
  .filter (item) -> item.name?.indexOf(key)>-1 || item.pinyin?.indexOf(key)>-1
  .sortBy (item) -> item.name.length
  .first(20)
  .sortBy (item) ->
    _.chain(item.name.indexOf(key), item.pinyin.indexOf(key))
    .filter (i) -> i > -1
    .min().value()
  .pluck('name')
  .value()

getTreeNodes = (name) ->
  name = (if name is '全部诊断' then undefined else name)
  console.log(name)
  classifys = _.filter diagData.classifys, (item) -> item.super?.name == name
  .map (item) -> _.extend({isParent:true, async: true}, item)
  diags = if name
    _.filter diagData.diags, (item) -> item.classify?.name == name
  else
    []
  classifys.concat diags
