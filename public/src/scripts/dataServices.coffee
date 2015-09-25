window.YEMR = {} if !window.YEMR?

YEMR.queryDiag = (keyword, onResult) ->
  return onResult([]) if !keyword
  $.get '/querydiag', {keyword: keyword}, (res) ->
    onResult(res) if res
