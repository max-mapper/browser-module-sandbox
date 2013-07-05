var inherits = require('inherits')
var iframe = require('iframe')
var events = require('events')
var extend = require('extend')
var request = require('browser-request')
var detective = require('detective')

module.exports = function(opts) {
  return new Sandbox(opts)
}

function Sandbox(opts) {
  var self = this
  if (!opts) opts = {}
  this.container = opts.container || document.body
  this.iframeHead = opts.iframeHead || ""
  this.iframeBody = opts.iframeBody || ""
  this.cdn = opts.cdn || window.location.protocol + '//' + window.location.host
  this.iframe = iframe({ container: this.container, scrollingDisabled: true })
  this.iframeStyle = "<style type='text/css'> html, body { margin: 0; padding: 0; border: 0; } </style>"
}

Sandbox.prototype.bundle = function(entry) {
  var self = this
  var modules = detective(entry)
  self.emit('bundleStart')
  var body = {
    "options": {
      "debug": true
    },
    "dependencies": {}
  }
  modules.map(function(module) {
    body.dependencies[module] = 'latest'
  })
  request({method: "POST", body: body, url: this.cdn + '/multi', json: true}, function(err, resp, json) {
    var allBundles = ''
    Object.keys(json).map(function(module) {
      allBundles += json[module]
    })
    // setTimeout is because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded!
    var body = self.iframeBody + 
      '<script type="text/javascript"> setTimeout(function(){' + 
        allBundles +
        entry +
      '}, 0)</script>'
    self.iframe.setHTML({ head: self.iframeHead + self.iframeStyle, body: body })
    self.emit('bundleEnd')
  })
}

inherits(Sandbox, events.EventEmitter)
