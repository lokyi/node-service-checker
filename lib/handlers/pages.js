const helpers = require('../helpers')

const pages = {}

function serveTemplate(data, templateData, pageName, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        helpers.getTemplate(pageName, templateData, (err, str) => {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html');
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        })
    } else {
        callback(405, undefined, 'html');
    }
}

// Index handler
pages.index = function (data, callback) {
    let templateData = {
        'head.title': 'Uptime Monitoring - Made Simple',
        'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we will send you a text to let you know',
        'body.class': 'index'
    }
    serveTemplate(data, templateData, 'index', callback)
}

// Create Account
pages.accountCreate = function (data, callback) {
    let templateData = {
        'head.title': 'Create an account',
        'head.description': 'Sign up is easy and only takes a few seconds',
        'body.class': 'accountCreate'
    }
    serveTemplate(data, templateData, 'accountCreate', callback)
}

// Account Edit
pages.accountEdit = function (data, callback) {
    let templateData = {
        'head.title': 'Account Settings',
        'body.class': 'accountEdit'
    }
    serveTemplate(data, templateData, 'accountEdit', callback)
}

// Account Deleted
pages.accountDeleted = function (data, callback) {
    let templateData = {
        'head.title': 'Account Deleted',
        'head.description': 'Your account has been deleted',
        'body.class': 'accountDeleted'
    }
    serveTemplate(data, templateData, 'accountDeleted', callback)
}

// Create Session
pages.sessionCreate = function (data, callback) {
    let templateData = {
        'head.title': 'Login to your account',
        'head.description': 'Please enter your phone number and password to access your account',
        'body.class': 'sessionCreate'
    }
    serveTemplate(data, templateData, 'sessionCreate', callback)
}

// Session Deleted
pages.sessionDeleted = function (data, callback) {
    let templateData = {
        'head.title': 'Logged Out',
        'head.description': 'You have been logged out of your account',
        'body.class': 'sessionDeleted'
    }
    serveTemplate(data, templateData, 'sessionDeleted', callback)
}

// Create a new check
pages.checksCreate = function (data, callback) {
    let templateData = {
        'head.title': 'Create a New Check',
        'body.class': 'checksCreate'
    }
    serveTemplate(data, templateData, 'checksCreate', callback)
}

// Dashbiard (view all checks)
pages.checksList = function (data, callback) {
    let templateData = {
        'head.title': 'Dashboard',
        'body.class': 'checksList'
    }
    serveTemplate(data, templateData, 'checksList', callback)
}

// Edit a Check
pages.checksEdit = function (data, callback) {
    let templateData = {
        'head.title': 'Check Details',
        'body.class': 'checksEdit'
    }
    serveTemplate(data, templateData, 'checksEdit', callback)
}

module.exports = pages;
