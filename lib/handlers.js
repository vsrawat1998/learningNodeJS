import { read, create, deleteFile, update } from './data';
import { hash } from './helpers';
// Define the handlers
const handlers = {
    // Users
    users: (data, callback) => {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._users[data.method](data, callback);
        } else {
            callback(405);
        }
    },
    // Container for users sub-methods
    _users: {
        // POST
        // Required data: firstName, lastName, phone, password, tosAgreement
        post: (data, callback) => {
            // Check for required fields
            const firstName =
                typeof data.payload.firstName == 'string' &&
                data.payload.firstName.trim().length > 0
                    ? data.payload.firstName.trim()
                    : false;
            const lastName =
                typeof data.payload.lastName == 'string' &&
                data.payload.lastName.trim().length > 0
                    ? data.payload.lastName.trim()
                    : false;
            const phone =
                typeof data.payload.phone == 'string' &&
                data.payload.phone.trim().length == 10
                    ? data.payload.phone.trim()
                    : false;
            const password =
                typeof data.payload.password == 'string' &&
                data.payload.password.trim().length > 0
                    ? data.payload.password.trim()
                    : false;
            const tosAgreement =
                typeof data.payload.tosAgreement == 'boolean' &&
                data.payload.tosAgreement
                    ? true
                    : false;
            if (firstName && lastName && phone && password && tosAgreement) {
                // Make sure that the user doesn't exist
                read('users', phone, (err, data) => {
                    if (err) {
                        // Hash the password
                        const hashedPassword = hash(password);
                        if (hashedPassword) {
                            // Create user obj

                            const userObject = {
                                firstName,
                                lastName,
                                phone,
                                hashedPassword,
                                tosAgreement: true
                            };

                            // Store the user
                            create('users', phone, userObject, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {
                                        Error: 'Could not create the new user'
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                Error: `Could not hash the user's password`
                            });
                        }
                    } else {
                        callback(400, {
                            Error:
                                'A user with that phone number already exists'
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required fields' });
            }
        },
        // Required data: phone
        // Optional data: none
        // @TODO only let authenticated user to access their object
        get: (data, callback) => {
            // Check that the phone number is valid
            const phone =
                typeof data.queryStringObject.phone == 'string' &&
                data.queryStringObject.phone.trim().length == 10
                    ? data.queryStringObject.phone.trim()
                    : false;
            if (phone) {
                read('users', phone, (err, data) => {
                    if (!err && data) {
                        // Remove the hashed password before returning to the requester
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        },
        // Required data: phone
        // Optional data: firstName, lastName, password (at least one must be specified)
        // @TODO only let authenticated user to access their object
        put: (data, callback) => {
            // Check that the phone number is valid
            const phone =
                typeof data.payload.phone == 'string' &&
                data.payload.phone.trim().length == 10
                    ? data.payload.phone.trim()
                    : false;
            // Check for optional fields
            const firstName =
                typeof data.payload.firstName == 'string' &&
                data.payload.firstName.trim().length > 0
                    ? data.payload.firstName.trim()
                    : false;
            const lastName =
                typeof data.payload.lastName == 'string' &&
                data.payload.lastName.trim().length > 0
                    ? data.payload.lastName.trim()
                    : false;
            const password =
                typeof data.payload.password == 'string' &&
                data.payload.password.trim().length > 0
                    ? data.payload.password.trim()
                    : false;
            if (phone) {
                if (firstName || lastName || password) {
                    read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Update the fields necessary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.hashedPassword = hash(password);
                            }
                            // Store the new updates
                            update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {
                                        '500': 'Could not update the user'
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                Error: 'The specified user does not exist'
                            });
                        }
                    });
                } else {
                    callback(400, { Error: 'Missing field to update' });
                }
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        },
        // Required data: phone
        // @TODO only let authenticated user to access their object
        // @TODO Clenup (delete) any other data files associated with this user
        delete: (data, callback) => {
            // Check that the phone number is valid
            const phone =
                typeof data.queryStringObject.phone == 'string' &&
                data.queryStringObject.phone.trim().length == 10
                    ? data.queryStringObject.phone.trim()
                    : false;
            if (phone) {
                read('users', phone, (err, data) => {
                    if (!err && data) {
                        deleteFile('users', phone, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {
                                    Error: 'Could not delete specified user'
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            Error: 'Could not find the specified user'
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        }
    },

    // Tokens
    tokens: (data, callback) => {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._tokens[data.method](data, callback);
        } else {
            callback(405);
        }
    },
    _tokens: {
        // Required data: phone, password
        // optional data: none
        post: (data, callback) => {
            const phone =
                typeof data.payload.phone == 'string' &&
                data.payload.phone.trim().length == 10
                    ? data.payload.phone.trim()
                    : false;
            const password =
                typeof data.payload.password == 'string' &&
                data.payload.password.trim().length > 0
                    ? data.payload.password.trim()
                    : false;
        },
        get: (data, callback) => {},
        put: (data, callback) => {},
        delete: (data, callback) => {}
    },
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
