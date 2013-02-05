var inherits = require('inherits')
var iframe = require('iframe')
var editor = require('javascript-editor')
var events = require('events')
var extend = require('extend')
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
  var defaultEditorOptions = {
    value: this.defaultCode,
    container: this.editorEl
  }
  var editorOptions = extend({}, defaultEditorOptions, opts.codemirrorOptions || {})
  this.editor = editor(editorOptions)
  this.iframe = iframe({ container: this.outputEl, scrollingDisabled: true })
  this.iframeStyle = "<style type='text/css'> html, body { margin: 0; padding: 0; border: 0; } </style>"
  self.on('output', function() {
    if (typeof game !== "undefined") game = undefined
    self.emit('bundleStart')
    var body = self.editor.editor.getValue()
    request({method: "POST", body: body, url: this.snuggieAPI, json: true}, function(err, resp, json) {
      // setTimeout is because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded!
      var body = '<script type="text/javascript"> setTimeout(function(){' + json.bundle + '}, 0)</script>'
      self.iframe.setHTML({ head: self.iframeStyle, body: body })
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
    }
    if (el === self.editorEl) {
      if (!self.editorEl.className.match(/hidden/)) return
      elementClass(self.editorEl).remove('hidden')
      elementClass(self.outputEl).add('hidden')
      self.emit('edit')
    }
  })  
}

inherits(Sandbox, events.EventEmitter)
