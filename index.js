import http from 'http';
import https from 'https';
import { parse } from 'url';
import { StringDecoder } from 'string_decoder';
import { httpPort, httpsPort, envName } from './config';
import { readFileSync } from 'fs';

// Instantiate HTTP server
var httpsServerOptions = {
    key: readFileSync('./https/key.pem'),
    cert: readFileSync('./https/cert.pem')
};
var httpServer = http.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Start the server
httpServer.listen(httpPort, () => {
    console.log(
        `HTTP Server listening on port ${httpPort} in ${envName} mode!`
    );
});

// Instantiate HTTPS server
var httpsServer = https.createServer((req, res) => {
    unifiedServer(req, res);
});

// Start the server
httpsServer.listen(httpsPort, () => {
    console.log(
        `HTTPS Server listening on port ${httpsPort} in ${envName} mode!`
    );
});

// Add the server logic for both http and https
var unifiedServer = (req, res) => {
    // Get and parse the url
    const parsedUrl = parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '').trim();
    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any

    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to,
        // if one is not found choose the notFound handler

        var chosenHandler =
            typeof router[trimmedPath] !== 'undefined'
                ? router[trimmedPath]
                : handlers.notFound;

        // Construct data object to send to the handler
        var data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            headers: headers,
            method: method,
            payload: buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called by the handler or default to 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200;
            // Use the payload called by the handler or default to an empty object
            payload = typeof payload === 'object' ? payload : {};

            // Convert the payload to string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
            console.log(
                `Returning this response: ${statusCode} ${payloadString}`
            );
        });
    });
};

// Define a request router
const handlers = {
    ping: (data, callback) => {
        callback(200);
    },
    notFound: (data, callback) => {
        callback(404);
    }
};

var router = {
    ping: handlers.ping
};
