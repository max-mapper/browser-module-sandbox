var snuggie = require('snuggie')
var ecstatic = require('ecstatic')('./www')
var uglify = require('uglify-js')
var zlib = require('zlib')

var http = require('http').createServer(function(req, res) {
  if (["POST", "PUT", "OPTIONS"].indexOf(req.method) > -1) {
    snuggie.handler(req, function(err, bundle) {
      if (err) return snuggie.respond(res, JSON.stringify(err))
      var minified = uglify.minify(bundle, {fromString: true}).code
      var body = JSON.stringify({bundle: minified})
      if (req.headers['accept-encoding'] && req.headers['accept-encoding'].match('gzip')) {
        zlib.gzip(body, function(err, buffer) {
          res.setHeader('Content-Encoding', 'gzip')
          snuggie.respond(res, buffer)
        })
      } else {
        snuggie.respond(res, body)
      }
    })
    return
  } 
  return ecstatic(req, res)
}).listen(8080)
