var elementClass = require('element-class')
var creator = require('../')

var gameCreator = creator({
  output: document.querySelector('#play'),
  controls: document.querySelector('#controls'),
  editor: document.querySelector('#edit'),
})

var crosshair = document.querySelector('#crosshair')
var crosshairClass = elementClass(crosshair)

gameCreator.on('bundleStart', function() {
  crosshairClass.add('spinning')
})

gameCreator.on('bundleEnd', function() {
  crosshairClass.remove('spinning')
})