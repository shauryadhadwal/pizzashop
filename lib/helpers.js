/*
 * Helpers
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

// Container for all the helpers
const helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a SHA256 hash
helpers.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        var str = '';
        for (i = 1; i <= strLength; i++) {
            // Get a random charactert from the possibleCharacters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the string
            str += randomCharacter;
        }
        // Return the final string
        return str;
    } else {
        return false;
    }
};

// Create a POST request for making a payment using STRIPE API
helpers.stripePaymentRequest = (orderData, callback) => {

    const payload = {
        amount: orderData.amount,
        currency: orderData.currency,
        source: orderData.source,
        description: orderData.description
    }

    const payLoadString = querystring.stringify(payload);

    const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'method': 'POST',
        'port': 443,
        'path': '/v1/charges',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payLoadString),
            'Authorization': 'Bearer ' + config.stripe.secret,
            'Accept': '*/*'
        }
    }   

    const req = https.request(requestDetails, (res) => {
        const status = res.status;

        if (status == 200 || status == 201) {
            callback(false);
        } else {
            callback('Transaction Failure');
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', (e) => {
        console.log(e);
        callback(e);
    });

    // Add the payload
    req.write(payLoadString);

    // End the stripeRequest
    req.end();
}

// Required: from, to, subject, text
helpers.mailgunRequest = (data, callback) => {
    
    // Configure the request payload
    var payload = {
        'from': data.from,
        'to': data.to,
        'subject': data.subject,
        'text': data.text  
    }

    var payloadString = querystring.stringify(payload);

    // Configure the request details
    var mailgunRequestDetails = {
        'protocol': 'https:',
        'hostname': 'api.mailgun.net',
        'path': '/v3/sandbox4494b3e8468445cd81f94823537b614e.mailgun.org',
        'port': 443,
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payloadString),
            'auth': 'api:'+ config.mailgun.api
        }
    }

    // Instantiate the request object
    const mailgunReq = https.request(mailgunRequestDetails,function(res) {
        // Grab the status of the sent request
        var status =  res.statusCode;
        // console.log('Mailgun debug info:', res);
       
        // Callback successful if the request went through
        if(status == 200 || status == 201){
        	console.log('\nFrom: ' + data.from);
        	console.log('To: ' + data.to);
        	console.log('Subject: ' + data.subject);
        	console.log('\n' + data.text + '\n');

            callback(false);                                
        } else{
            callback('Could not send email');
        }
    });

    // Bind to the error event so it doesn't get thrown
    mailgunReq.on('error',function(e){
        callback(e);
    });

    // Add the payload
    mailgunReq.write(payloadString);

    // End the mailgunRequest
    mailgunReq.end();
};

// Export the module
module.exports = helpers;
