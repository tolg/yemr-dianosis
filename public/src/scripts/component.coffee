view = require('view.string')
treeBase = [{ id:'', pid:'', name:"全部诊断", isParent:true, async: true}]
window.g = (id) -> document.getElementById(id)


class Diagnosis
  constructor: ({node,isOphthalmology,diags,@queryDiag,@validationDiag}) ->
    @qualifiers = ['左', '右', '双', '左侧', '右侧', '双侧']
    @qualifiers = ['左眼', '右眼', '双眼'].concat @qualifiers if isOphthalmology
    @qualifyReg = new RegExp ('^(' +
      _.sortBy(@qualifiers, (w) -> -w.length).join('|') +
      ')')
    node = @ctn = $ node
    node.html(view)
    @dom = @ctn.find '.yemr-diags-ctn'
    @popTip = node.find '.yemr-diag-tip-ctn'
    @ctn =
    @vm = avalon.define
      $id: 'diag'
      $skip: ['prefixChange', 'keyHandller', 'blurHandller', 'addLine'
      , 'removeLine', 'suggestOptions', 'treewinOpts', 'showTreewin']
      diags: diags || ['']
      qualifiers: [''].concat @qualifiers
      tips: []
      inputWidth: 200
      suggestOptions:
        suggest: 'diagtip'
        autoTrim: false
      draggable:
        handle: (e) -> $(e.target).closest('.handle')[0]
        stopFn: (e, data, index) =>
          thisIndex = data.$element.data('index')
          thisTop = data.$element.offset().top
          newIndex = 0
          lines = @dom.children('.yemr-diag-line')
          nextLine = _.find lines, (line, i) ->
            newIndex = i
            $(line).offset().top > thisTop
          if !nextLine then newIndex++
          movingDiag = @vm.diags.splice(thisIndex, 1)
          newIndex-- if newIndex > thisIndex
          @vm.diags.splice(newIndex, 0, movingDiag)
          @fixLine(newIndex)
      prefixChange: (event, diag, index) =>
        newPrefix = $(event.target).val()
        parts = @destructDiag diag
        @getLine(index).val(parts.preSpace + newPrefix + parts.prime)
      keyHandller: (event, index) =>
        if @getLine(index).closest('.oni-textbox')
        .find('.oni-suggest').css('display') is 'none'
          switch event.keyCode
            when 13 then @addLine index
            when 38 then @focusLine index-1
            when 40 then @focusLine index+1
      blurHandller: (event, index) =>
        @fixLine index
      addLine: (index, value) => @addLine index if value
      removeLine: (index) => @removeLine index
      treewinOpts:
        title: '请选择'
        draggable: true
        onOpen: @initTreeWin
        width: 600
      showTreewin: (index) ->
        avalon.vmodels.treewin.toggle = true
      waitOpt:
        type: 'spinning-bubbles'
        container: document.body
        color: '#cdf'
        modalBackground: '#000'
        modalOpacity: 0.4
        toggle: false
      tree:
        children: treeBase
        async:
          enable: true,
          autoParam: ["name"]
          url: '/getdiagtree'
        edit:
          enable: false
      $treeOpt:
        children: [treeBase]



    avalon.scan(node[0])
    @_initDiagTip()
    @fixSize()
    @dom.on 'mouseover', '.yemr-diag-line', ->
      $(this).children('.handle').css('background-position', '0px 0px')
    @dom.on 'mouseout', '.yemr-diag-line', ->
      $(this).children('.handle').css('background-position', '100px 0px')

  getLine: (index) ->
    inputs = @dom.find('.yemr-diag-input')
    if index in [0..inputs.length] then inputs.eq(index) else null

  getLineWrapper: (index) ->
    lines = @dom.children('.yemr-diag-line')
    if index in [0..lines.length] then lines.eq(index) else null

  fixLine: (index) ->
    value = @getLine(index).val() #此时vm.diags里面的相应值不是select控件选择的值，故直接从dom取值
    parts = @destructDiag value
    return @removeLine index if !parts.prime and @vm.diags.length>1
    @getLineWrapper(index)
    .find('select.yemr-diag-qualifier').val(parts.prefix)
    parts.preSpace = '' if index is 0
    parts.prime = parts.prime.replace(/\s+/g, '　')
    .replace(/IV/ig, 'Ⅳ').replace(/III/ig, 'Ⅲ')
    .replace(/II/ig, 'Ⅱ').replace(/I/ig, 'Ⅰ')
    thisLine = @getLine(index)
    thisLineWrapper = thisLine.closest('.oni-textbox')
    thisLineWrapper.add(thisLine).css('background', '#fff')
    value = parts.preSpace + parts.prefix + parts.prime
    thisLine.val(value) #直接对数组元素赋值貌似无法绑定到dom上
    $.get '/validatediag', {diag: parts.prime}, (r) ->
      if r.valid
        formalValue = parts.preSpace + parts.prefix + r.formalName
        thisLineWrapper.add(thisLine).css('background', '#e1f6df').val(formalValue)

  addLine: (index) ->
    index++
    @vm.diags.splice(index, 0, '')
    @getLine(index)?.focus()

  removeLine: (index) ->
    @vm.diags.splice(index,1)

  focusLine: (index) ->
    @getLine(index)?.focus()

  fixSize: ->
    @vm.inputWidth = @dom.width() - 170

  _initDiagTip: ->
    avalon.ui.suggest.strategies.diagtip = (value, done) =>
      log '进入suggest触发'
      parts = @destructDiag(value)
      log '准备进入查找诊断'
      @queryDiag? parts.prime, (results) ->
        log '得到查找结果，准备处理'
        if parts.preSpace || parts.prefix
          results = (parts.preSpace + parts.prefix + r for r in results)
        log '查找结果处理完毕，准备输出到页面'
        done results
        log '输出到页面完毕'

  _initTreeWin: ->
    #TODO:

  # 把一行的输入内容分解为 前空格、前缀词和主要内容
  destructDiag: (value) ->
    value = value.replace '\u0008', ''
    {
      preSpace: if /^\s+/.test(value) then '　' else ''
      prefix: value.replace(/^\s+/, '').match(@qualifyReg)?[0] || ''
      prime: value.replace(/^\s+/, '').replace(/\s+$/, '').replace(@qualifyReg, '')
    }

  loading: (show) ->
    avalon.vmodels.wait.toggle = show

  save: (callback) ->
    @loading(true)

window.YEMR = {} if !window.YEMR?
window.YEMR.Diagnosis = Diagnosis
