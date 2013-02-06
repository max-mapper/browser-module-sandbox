var inherits = require('inherits')
var iframe = require('iframe')
var events = require('events')
var extend = require('extend')
var request = require('browser-request')

module.exports = function(opts) {
  return new Sandbox(opts)
}

function Sandbox(opts) {
  var self = this
  if (!opts) opts = {}
  this.container = opts.container || document.body
  this.iframeHead = opts.iframeHead || ""
  this.iframeBody = opts.iframeBody || ""
  this.snuggieAPI = opts.snuggieAPI || window.location.protocol + '//' + window.location.host
  this.iframe = iframe({ container: this.container, scrollingDisabled: true })
  this.iframeStyle = "<style type='text/css'> html, body { margin: 0; padding: 0; border: 0; } </style>"
}

Sandbox.prototype.bundle = function(body) {
  var self = this
  self.emit('bundleStart')
  request({method: "POST", body: body, url: this.snuggieAPI, json: true}, function(err, resp, json) {
    // setTimeout is because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded!
    var body = self.iframeBody + '<script type="text/javascript"> setTimeout(function(){' + json.bundle + '}, 0)</script>'
    self.iframe.setHTML({ head: self.iframeHead + self.iframeStyle, body: body })
    self.emit('bundleEnd')
  })
}

inherits(Sandbox, events.EventEmitter)
