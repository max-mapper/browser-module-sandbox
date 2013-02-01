var CodeMirror = require('./codemirror/codemirror').CodeMirror
var inherits = require('inherits')
var events = require('events')
var toolbar = require('toolbar')
var elementClass = require('element-class')
var request = require('browser-request')

// todo read from template/file
var defaultGame = "var createGame = require('voxel-engine')\n\n" +
"window.game = createGame()\n\n" +
"// rotate camera to look straight down\n" +
"game.controls.pitchObject.rotation.x = -1.5\n\n" + 
"var container = document.querySelector('#play')\n" +
"game.appendTo(container)\n" + 
"container.addEventListener('click', function() {\n  " +
  "game.requestPointerLock(container)\n" +
"})\n"


module.exports = function(opts) {
  return new Creator(opts)
}

function Creator(opts) {
  var self = this
  if (!opts) opts = {}
  this.outputEl = opts.output || document.body
  this.editorEl = opts.editor || document.body
  this.showControls(opts.controls)
  this.editor = CodeMirror(this.editorEl, {
    value: opts.functionBody || defaultGame,
    mode:  "javascript"
  })
  
  self.on('edit', function() {
    if (typeof game !== "undefined") game = undefined
    var canvas = self.outputEl.querySelector('canvas')
    if (canvas) self.outputEl.removeChild(canvas)
  })
    
  self.on('output', function() {
    self.emit('bundleStart')
    var url = window.location.protocol + '//' + window.location.host
    var url = 'http://localhost:8080'
    var body = self.editor.getValue()
    request({method: "POST", body: body, url: url, json: true}, function(err, resp, json) {
      if (json.error) return alert(json.error)
      eval(json.bundle)
      self.emit('bundleEnd')
    })
    
  })
}

Creator.prototype.showControls = function(container) {
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

inherits(Creator, events.EventEmitter)
