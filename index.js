var CodeMirror = require('./codemirror/codemirror').CodeMirror
var inherits = require('inherits')
var events = require('events')
var toolbar = require('toolbar')
var elementClass = require('element-class')
var request = require('browser-request')

module.exports = function(opts) {
  return new Sandbox(opts)
}

function Sandbox(opts) {
  var self = this
  if (!opts) opts = {}
  this.defaultCode = opts.defaultCode || "var url = require('url')\n"
  this.outputEl = opts.output || document.body
  this.editorEl = opts.editor || document.body
  this.snuggieAPI = opts.snuggieAPI || window.location.protocol + '//' + window.location.host
  this.showControls(opts.controls)
  this.editor = CodeMirror(this.editorEl, {
    value: opts.functionBody || this.defaultCode,
    mode:  "javascript"
  })
    
  self.on('output', function() {
    if (typeof game !== "undefined") game = undefined
    self.emit('bundleStart')
    var body = self.editor.getValue()
    request({method: "POST", body: body, url: this.snuggieAPI, json: true}, function(err, resp, json) {
      if (json.error) return alert(json.error)
      eval(json.bundle)
      self.emit('bundleEnd')
    })
  })
}

Sandbox.prototype.showControls = function(container) {
  var self = this
  this.controls = toolbar({el: container, noKeydown: true})
  this.controls.on('select', function(item) {
    var className = '#' + item
    var el = document.querySelector(className)
    if (el === self.outputEl) {
      elementClass(self.outputEl).remove('hidden')
      elementClass(self.editorEl).add('hidden')
      self.emit('output')
    } else {
      elementClass(self.editorEl).remove('hidden')
      elementClass(self.outputEl).add('hidden')
      self.emit('edit')
    }
  })  
}

inherits(Sandbox, events.EventEmitter)
