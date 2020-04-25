// Define a the handlers
const handlers = {
    // Ping service
    ping: (data, callback) => {
        callback(200);
    },
    // Not Found
    notFound: (data, callback) => {
        callback(404);
    }
};

export default handlers;
