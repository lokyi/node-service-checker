// Index handler
handlers.index = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we will send you a text to let you know',
            'body.class': 'index'
        }
        helpers.getTemplate('index', templateData, (err, str) => {
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

// Create Account
handlers.accountCreate = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Create an account',
            'head.description': 'Sign up is easy and only takes a few seconds',
            'body.class': 'accountCreate'
        }
        helpers.getTemplate('accountCreate', templateData, (err, str) => {
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

// Account Edit
handlers.accountEdit = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Account Settings',
            'body.class': 'accountEdit'
        }
        helpers.getTemplate('accountEdit', templateData, (err, str) => {
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

// Create Session
handlers.sessionCreate = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Login to your account',
            'head.description': 'Please enter your phone number and password to access your account',
            'body.class': 'sessionCreate'
        }
        helpers.getTemplate('sessionCreate', templateData, (err, str) => {
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

// Session Deleted
handlers.sessionDeleted = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Logged Out',
            'head.description': 'You have been logged out of your account',
            'body.class': 'sessionDeleted'
        }
        helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
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

// Account Deleted
handlers.accountDeleted = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Account Deleted',
            'head.description': 'Your account has been deleted',
            'body.class': 'accountDeleted'
        }
        helpers.getTemplate('accountDeleted', templateData, (err, str) => {
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

// Create a new check
handlers.checksCreate = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Create a New Check',
            'body.class': 'checksCreate'
        }
        helpers.getTemplate('checksCreate', templateData, (err, str) => {
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

// Dashbiard (view all checks)
handlers.checksList = function (data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
        // Prepare data for the interpolation
        let templateData = {
            'head.title': 'Dashboard',
            'body.class': 'checksList'
        }
        helpers.getTemplate('checksList', templateData, (err, str) => {
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

// Edit a Check
handlers.checksEdit = function (data, callback) {
    
}

function serveTemplate (data, templateData, pageName, callback) {
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