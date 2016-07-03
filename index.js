var muxrpc     = require('muxrpc')
var pull       = require('pull-stream')
var ssbKeys    = require('ssb-keys')

var MultiServer = require('multiserver')
var WS          = require('multiserver/plugins/ws')
var Shs         = require('multiserver/plugins/shs')


var cap =
  new Buffer('1KHLiKZvAvjbY1ziZEHMXawbCEIM6qwjCDm3VYRan/s=', 'base64')

function toSodiumKeys(keys) {
  return {
    publicKey:
      new Buffer(keys.public.replace('.ed25519',''), 'base64'),
    secretKey:
      new Buffer(keys.private.replace('.ed25519',''), 'base64'),
  }
}


module.exports = function (keys, opts, cb) {
//  if('function' === typeof remote)
//    cb = remote,
  var remote = '@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519'

  console.log("ssb-lite", keys, opts, cb)
  console.log("REMOTE", remote)
//  var keys = ssbKeys.loadOrCreateSync('/home/dominic/.ssb/secret')

  var ms = MultiServer([
    [WS(), Shs({
      keys: toSodiumKeys(keys),
      appKey: cap,

      //no client auth. we can't receive connections anyway.
      auth: function (cb) { cb(null, false) },
      timeout: 3000
    })]
  ])
  // create rpc object

  var id = remote.substring(1).replace('.ed25519', '')
  ms.client('ws://localhost:8989~shs:'+id, function (err, stream) {
    if(err) return cb(err)
    
    var sbot = muxrpc(require('/home/dominic/.ssb/manifest.json'), false)()
    pull(stream, sbot.createStream(), stream)
    cb(null, sbot)
  })

}

//MY own public key, hardcoded.
//this module not yet ready for general consumption.
//var remote = '@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519'
//module.exports(remote, function (err, sbot) {
//  if(err) throw err
//  sbot.whoami(function (err, me) {
//    if(err) throw err
//    console.log(JSON.stringify(me, null, 2))
//    sbot.close()
//  })
//})
//
//
