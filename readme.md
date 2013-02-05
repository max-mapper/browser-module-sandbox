# browser-module-sandbox

editor for code that gets 'compiled' on the server with node and then sent back and executed on the client.

there are two "panes", one is a codemirror editor pane and other is a display pane that shows the output (if any) of the program. there is also a built in toolbar UI widget for switching between the two states

for an example go see the [voxel-gist](http://github.com/maxogden/voxel-gist) project

to compile the dependencies on the server you should run an instance of [snuggie](https://github.com/maxogden/snuggie)

```
npm install browser-module-sandbox
```

## usage

```javascript
var sandbox = require('browser-module-sandbox')
```

## sandbox(options)

you need to give it dom elements as targets that it will use to to render itself. `output` and `editor` for the two "panes" that get turned on and off based on the state of `control`.

```javascript
var sandbox = sandbox({
  snuggieAPI: 'http://localhost:8000', // defaults to the current browser domain root
  defaultCode: "var foo = require('foo')", // defaults to 'var url = require("url")'
  output: document.querySelector('#output'),
  controls: document.querySelector('#controls'),
  editor: document.querySelector('#edit'),
  codemirrorOptions: {}
})
```

## sandbox.on('bundleStart') && sandbox.on('bundleEnd')

these fire when the output pane is activated. the sandbox will emit `bundleStart`, upload the contents of the editor to the server, and then when it receives and renders them will emit `bundleEnd`

## sandbox.on('edit')

this fires when the edit button is clicked, which also switches back to the editor

## license

BSD