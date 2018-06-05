/*
 * Library for storing and rotating logs
*/

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const lib = {}

// Base firectory of the logs folder
lib.baseDir = path.join(__dirname, '/../.logs/')

// Append a string to a file. Create the file if it does not exist
lib.append = function (file, str, callback) {
	// Open the file for appending
	fs.open(this.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
		if (!err && fileDescriptor) {
			// Append to the filex
			fs.appendFile(fileDescriptor, str + '\n', err => {
				if (!err) {
					fs.close(fileDescriptor, err => {
						if (!err) {
							callback(null)
						} else {
							callback('Error closing file that was being appended')
						}
					})
				} else {
					callback('Error appending to file')
				}
			})
		} else {
			callback('Could not open file for appending')
		}
	})
}

// List all the logs and optionally include the compressed logs
lib.list = function (includeCompressedLogs, callback) {
	fs.readdir(this.baseDir, (err, data) => {
		if (!err && data && data.length > 0) {
			let trimmedFileNames = []
			data.forEach(fileName => {
				// Add the .log files
				if (fileName.includes('.log')) {
					trimmedFileNames.push(fileName.replace('.log', ''))
				}
				// Add on the .gz files
				if (includeCompressedLogs && fileName.includes('.gz.b64')) {
					trimmedFileNames.push(fileName.replace('.gz.b64', ''))
				}
			})
			callback(null, trimmedFileNames)
		} else {
		   callback(err, data) 
		}
	})
}

// Compress the contents of one .log file into a .gz.b64 file
lib.compress = function (logId, newFileId, callback) {
  let sourceFile = logId + '.log'
  let destFile = newFileId + '.gz.b64'

  // Read the source file
  fs.readFile(this.baseDir + sourceFile, 'utf8', (err, inputString) => {
    if (!err && inputString) {
      // Compress the data using gzip
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) {
          fs.open(this.baseDir + destFile, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              fs.writeFile(fileDescriptor, buffer.toString('base64'), err => {
                if (!err) {
                  fs.close(fileDescriptor, callback)
                } else {
                  callback(err)
                }
              })
            } else {
              callback(err)
            }
          })
        } else {
          callback(err)
        }
      })
    } else {
      callback(err)
    }
  })
}

// Decompress the contents of one .gz.b64 file into a string variable
lib.decompress = function (fileId, callback) {
  let fileName = fileId + '.gz.b64'
  fs.readFile(this.baseDir + fileName, 'utf8', (err, str) => {
    if (!err && str) {
      // Decompress the data
      let inputBuffer = Buffer.from(str, 'base64')
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          let str = outputBuffer.toString()
          callback(null, str)
        } else {
          callback(err)
        }
      })
    } else {
      callback(err)
    }
  })
}

// Truncate a log file
lib.truncate = function (logId, callback) {
  fs.truncate(this.baseDir + logId + '.log', 0, callback)
}

module.exports = lib