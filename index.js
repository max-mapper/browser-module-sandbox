var inherits = require('inherits')
var iframe = require('iframe')
var events = require('events')
var request = require('browser-request')
var detective = require('detective')
var createCache = require('browser-module-cache')

module.exports = function(opts) {
  return new Sandbox(opts)
}

function Sandbox(opts) {
  var self = this
  if (!opts) opts = {}
  this.name = opts.name
  this.container = opts.container || document.body
  this.iframeHead = opts.iframeHead || ""
  this.iframeBody = opts.iframeBody || ""
  this.cdn = opts.cdn || window.location.protocol + '//' + window.location.host
  this.iframe = iframe({ container: this.container, scrollingDisabled: true })
  this.iframeStyle = "<style type='text/css'>" + 
    "html, body { margin: 0; padding: 0; border: 0; }\n" +
    opts.iframeStyle +
    "</style>"
  this.cache = createCache(opts.cacheOpts)
}

inherits(Sandbox, events.EventEmitter)

Sandbox.prototype.bundle = function(entry, preferredVersions) {
  if (!preferredVersions) preferredVersions = {}
  var self = this
  
  var modules = detective(entry)
  
  self.emit('bundleStart')
  
  if (modules.length === 0) return makeIframe()

  var allBundles = ''
  var packages = []

  self.cache.get(function(err, cached) {
    if (err) {
      self.emit('bundleEnd')
      return err
    }

    var download = []
    modules.forEach(function(module) {
      module = module + '@' + (preferredVersions[module] || 'latest')

      if (cached[module]) {
        allBundles += cached[module]['bundle']
        packages.push(cached[module]['package'])
      } else {
        download.push(module)
      }
    })
    
    if (download.length === 0) {
      self.emit('modules', packages)
      return makeIframe(allBundles)
    }

    var body = {
      "options": {
        "debug": true
      },
      "dependencies": {}
    }
    
    download.map(function(module) {
      var tokens = module.split('@')
      var name = tokens[0]
      var version = tokens[1]
      body.dependencies[name] = version
    })
    
    request({method: "POST", body: JSON.stringify(body), url: self.cdn + '/multi'}, downloadedModules)
  })

  function downloadedModules(err, resp, body) {
    if (err) {
      self.emit('bundleError', err)
      return err
    } else if (resp.statusCode == 500) {
      self.emit('bundleError', body)
      return body
    }

    var json = JSON.parse(body)

    // fix json properties to also hold the package version
    // e.g.
    // "foo": {
    //  "package": {
    //    "version": "1.0.0"
    //  }
    // }
    // to:
    // "foo@1.0.0": { ... }
    //
    // NOTE: "foo@latest" is never cached because browserify-cdn
    // always returns a valid semver :)
    Object.keys(json).forEach(function (module) {
      var existing = json[module]
      json[module + '@' + existing.package.version] = json[module]
      delete json[module]
    })

    Object.keys(json).forEach(function(module) {
      allBundles += json[module]['bundle']
      packages.push(json[module]['package'])
    })

    self.cache.put(json, function() {
      self.emit('modules', packages)
      makeIframe(allBundles)
    })
  }
  
  function makeIframe(script) {
    script = (script || '')
    self.emit('bundleContent', script)
    script = script + entry
    // setTimeout is because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded!
    var body = self.iframeBody +
        '<script type="text/javascript" src="data:text/javascript;charset=UTF-8,'
      + encodeURIComponent('setTimeout(function(){\n;' + script + '\n;}, 0)')
      + '"></script>'
    var html = { head: self.iframeHead + self.iframeStyle, body: body, script: script }
    if (self.name) html.name = self.name
    self.iframe.setHTML(html)
    self.emit('bundleEnd', html)
  }
}
