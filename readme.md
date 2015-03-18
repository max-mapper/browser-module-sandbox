# browser-module-sandbox

uses browserify-cdn to run node code in an iframe

requires a hosted browserify-cdn

```
npm install browser-module-sandbox
```


## usage

```javascript
var Sandbox = require('browser-module-sandbox')
```

## initialize

### sandbox(options)

```javascript
var sandbox = Sandbox({
  name: iframe name attribute,
  cdn: 'http://localhost:8000', // browserify-cdn API endpoint, defaults to the current browser domain root,
  container: dom element where the iframe should be appended,
  iframeHead: string that gets prepended to the `<head>` of the output iframe,
  iframeBody: string that gets prepended to the `<body>` of the output iframe,
  iframeStyle: string for css, gets appended to end of iframeHead,
  iframe: iframe instance, default creates a new one inside container
})
```
## bundling

### sandbox.bundle(entry, preferredVersions)

```
sandbox.bundle('console.log(require("underscore"))', {'underscore': '1.3.3'})
```

`preferredVersions` is optional, version will otherwise default to `latest`

## events

### sandbox.on('modules', function(modules) {})

modules is the array of modules that gets parsed out of the bundle entry by the `detective` module

### sandbox.on('bundleStart', function() {})

emits when the bundle request begins

### sandbox.on('bundleContent', function(body) {})

emits when the iframe content is being built, `body` is a string made up of all the bundles (NOTE: it doesn't contain `entry`)

### sandbox.on('bundleEnd', function(html) {})

emits when the bundle request finishes. `html` is an object that has the iframe header contents and the full bundle body (made of up all the bundles + the entry in an executable form)

## license

BSD