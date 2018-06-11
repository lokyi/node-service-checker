const net = require('net')

let outboundMessage = 'ping'

// Create the client
let client = net.createConnection({ port: 6000 }, () => {
    client.write(outboundMessage)
})

// When the server write back
client.on('data', inboundMessage => {
    let messageString = inboundMessage.toString()
    console.log(`I wrote ${outboundMessage} and they said ${inboundMessage}`)
    client.end()
})
