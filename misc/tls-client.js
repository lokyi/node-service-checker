const tls = require('tls')
const fs = require('fs')
const path = require('path')

// Required due to self-signed certificate
let options = {
    'ca': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

let outboundMessage = 'ping'

// Create the client
let client = tls.connect(6000, options, () => {
    client.write(outboundMessage)
})

// When the server write back
client.on('data', inboundMessage => {
    let messageString = inboundMessage.toString()
    console.log(`I wrote ${outboundMessage} and they said ${inboundMessage}`)
    client.end()
})
