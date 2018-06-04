/*
 * Storing and editing data
 */

const fs = require('fs')
const path = require('path')

const helpers = require('./helpers')

var lib = {}

// Base dir
lib.baseDir = path.join(__dirname, '/../.data/')

// Write data to a file
lib.create = function (dir, file, data, callback) {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      var stringData = JSON.stringify(data)

      //Write to file and close it
      fs.writeFile(fileDescriptor, stringData, function (err) {
        if (!err) {
          fs.close(fileDescriptor, err => {
            if (!err) {
              callback(null)
            } else {
              callback('Error closing file')
            }
          })
        } else {
          callback('Error writing to new file')
        }
      })
    } else {
      callback('Could not create new file, it may already exist')
    }
  })
}

// Read Data from file
lib.read = function (dir, file, callback) {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
    if (!err && data) {
      let parsedData = helpers.parseJsonToObject(data)
      callback(null, parsedData)
    } else {
      callback(err, data)
    }
  })
}

// Update the data inside the file
lib.update = function (dir, file, data, callback) {
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //Write to file and close it
      fs.truncate(fileDescriptor, err => {
        if (!err) {
          // Convert data to string
          var stringData = JSON.stringify(data)
          fs.writeFile(fileDescriptor, stringData, function (err) {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  callback(null)
                } else {
                  callback('Error closing existing file')
                }
              })
            } else {
              callback('Error writing to existing file')
            }
          })
        } else {
          callback('Error truncating file')
        }
      })
    } else {
      callback('Could not open the file for update, it may not exist yet')
    }
  })
}

// Delete a file
lib.delete = function (dir, file, callback) {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', err => {
    if (!err) {
      callback(null)
    } else {
      callback('Error delete the file')
    }
  })
}

// List all the items in a directory
lib.list = function (dir, callback) {
  fs.readdir(this.baseDir + dir + '/', (err, data) => {
    if (!err && data && data.length > 0) {
      let trimmedFileNames = data.map(fileName => {
        return fileName.replace('.json', '')
      })
      callback(null, trimmedFileNames)
    } else {
      callback(err, data)
    }
  })
}

module.exports = lib;