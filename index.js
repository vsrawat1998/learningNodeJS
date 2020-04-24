import { createServer } from 'http';
import url from 'url';
import { StringDecoder as stringDecoder } from 'string_decoder';
import { port, envName } from './config';
// Server must respond to all requests
// console.log(process.env.NODE_ENV);
var server = createServer((req, res) => {
    // Get and parse the url
    const parsedUrl = parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any

    var decoder = new stringDecoder('utf-8');
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
});

server.listen(port, () => {
    console.log(`Server listening on port ${port} in ${envName} mode!`);
});

// Define a request router
var handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
    // Callback a http status code, and a payload object
    callback(406, { name: 'sample handler' });
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

var router = {
    sample: handlers.sample
};
