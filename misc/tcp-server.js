const net = require('net')

// Create server
let server = net.createServer(connection => {
	let outboundMessage = 'pong'
	connection.write(outboundMessage)

	// When the client writes something, log it out
	connection.on('data', inboundMessage => {
		messageStr = inboundMessage.toString()
		console.log(`I wrote ${outboundMessage} and they said ${inboundMessage}`)
	})    
})

server.listen(6000)
