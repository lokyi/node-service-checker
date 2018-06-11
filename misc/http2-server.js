const http2 = require('http2')

let server = http2.createServer()

// On a stream, send back hello world html
server.on('stream', (stream, headers) => {
    stream.respond({
        status: 200,
        'Content-Type': 'text/html'
    })
    stream.end('<html><body><p>Hello World</p></body></html>')
})

server.listen(6000)