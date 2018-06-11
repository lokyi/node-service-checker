const dgram = require('dgram')

let client = dgram.createSocket('udp4')

// Define the message and pull it into a buffer
let messageStr = 'This is a message'
let messageBuffer = Buffer.from(messageStr)

client.send(messageBuffer, 6000, 'localhost', err => {
    client.close()
})