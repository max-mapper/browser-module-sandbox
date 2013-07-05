var inherits = require('inherits')
var iframe = require('iframe')
var events = require('events')
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

Sandbox.prototype.bundle = function(entry, preferredVersions) {
  if (!preferredVersions) preferredVersions = {}
  var self = this
  
  var modules = detective(entry)
  self.emit('modules', modules)
  
  var body = {
    "options": {
      "debug": true
    },
    "dependencies": {}
  }
  
  modules.map(function(module) {
    var version = preferredVersions[module] || 'latest'
    body.dependencies[module] = version
  })
  
  self.emit('bundleStart')
  
  request({method: "POST", body: body, url: this.cdn + '/multi', json: true}, function(err, resp, json) {
    if (err) {
      self.emit('bundleEnd')
      return err
    }
    
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
    var html = { head: self.iframeHead + self.iframeStyle, body: body }
    self.iframe.setHTML(html)
    self.emit('bundleEnd', html)
  })
}

inherits(Sandbox, events.EventEmitter)
