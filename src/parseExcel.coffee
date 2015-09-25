_ = require('underscore')
fs = require 'fs'
py = require('pinyin')

getVoidSize = (row) ->
  _.filter(row, (w) -> !w?.trim()).length

normalizeSpaces = (input) ->
  input?.replace(/\s+$/, '')?.replace(/\s+/g, '　')

extractData = (rows) ->
  diags = []
  classifys = []
  currClassify = []

  classifyGenId = 0
  diagGenId = 0

  for row, lineNum in rows
    thisClassifys = []
    voidSize = getVoidSize row
    nextLineVoidSize = getVoidSize(rows[lineNum+1])
    filledCells = _.rest(row, voidSize)
    if lineNum is 0 or nextLineVoidSize > voidSize
      thisClassifys = _.chain(filledCells)
      .first(nextLineVoidSize-voidSize)
      .map((c, i) ->
        {name: c, super: id: ++classifyGenId})
      .value()
      {name: filledCells[0], id: ++classifyGenId}
    if thisClassifys?.length
      for c, i in thisClassifys
        c.super = if i is 0
          currClassify[voidSize-1] || null
        else
          thisClassifys[i-1]
      currClassify = _.first(currClassify, voidSize).concat thisClassifys
      classifys = classifys.concat thisClassifys
      filledCells = _.rest(filledCells, thisClassifys.length)
    mainDiag =
      name: normalizeSpaces(filledCells[0])
      id: ++diagGenId
      classify: _.last(currClassify)
      aliasFor: null
    mainDiag.pinyin = getPinyin(mainDiag.name)
    alias = _.map _.rest(filledCells), (alias) ->
      name: normalizeSpaces(alias)
      id: ++diagGenId
      classify: _.last(currClassify)
      aliasFor: mainDiag
    alias.pinyin = getPinyin(alias.name)
    diags = diags.concat(mainDiag).concat(alias)

  {diags: diags, classifys: classifys}

getPinyin = (zh) ->
  _.map zh, (c) ->
    py(c)[0]?[0]?.substr(0,1) || ''
  .join('')

module.exports = (file) ->
  # sheets = XLSX.parse(file)
  # rows = sheets[0].data
  # extractData(rows)
  # wb = new Excel.Workbook()
  # wb.csv.readFile(file).then ->
  #   rows = []
  #   wb.getWorksheet(1).eachRow (row) -> rows.push _.rest(row.values)
  #   console.log rows
  #   cb(extractData rows)
  rows = fs.readFileSync(file, 'utf8').split('\r').map (line)->
    row = line.split(';')
    row = row.filter (cell, i) ->
      cell or _.find row.slice(i+1), (rest) -> rest
    row
  extractData(rows)
