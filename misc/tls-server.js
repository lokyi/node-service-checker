const tls = require('tls')
const fs = require('fs')
const path = require('path')

let options = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

// Create server
let server = tls.createServer(options, connection => {
    let outboundMessage = 'pong'
    connection.write(outboundMessage)

    // When the client writes something, log it out
    connection.on('data', inboundMessage => {
        messageStr = inboundMessage.toString()
        console.log(`I wrote ${outboundMessage} and they said ${inboundMessage}`)
    })
})

server.listen(6000)
