import { read, create, deleteFile, update } from './data';
import { hash, createRandomString } from './helpers';
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
        get: (data, callback) => {
            // Check that the phone number is valid
            const phone =
                typeof data.queryStringObject.phone == 'string' &&
                data.queryStringObject.phone.trim().length == 10
                    ? data.queryStringObject.phone.trim()
                    : false;
            if (phone) {
                // Get the token from the header
                const token =
                    typeof data.headers.token == 'string'
                        ? data.headers.token
                        : false;
                // Verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
                    if (isTokenValid) {
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
                        callback(403, {
                            Error:
                                'Missing requried token in header or token is invalid'
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        },
        // Required data: phone
        // Optional data: firstName, lastName, password (at least one must be specified)
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
                    // Get the token from the header
                    const token =
                        typeof data.headers.token == 'string'
                            ? data.headers.token
                            : false;
                    handlers._tokens.verifyToken(
                        token,
                        phone,
                        (isTokenValid) => {
                            if (isTokenValid) {
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
                                            userData.hashedPassword = hash(
                                                password
                                            );
                                        }
                                        // Store the new updates
                                        update(
                                            'users',
                                            phone,
                                            userData,
                                            (err) => {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    console.log(err);
                                                    callback(500, {
                                                        '500':
                                                            'Could not update the user'
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(400, {
                                            Error:
                                                'The specified user does not exist'
                                        });
                                    }
                                });
                            } else {
                                callback(403, {
                                    Error:
                                        'Missing requried token in header or token is invalid'
                                });
                            }
                        }
                    );
                } else {
                    callback(400, { Error: 'Missing field to update' });
                }
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        },
        // Required data: phone
        // @TODO Cleanup (delete) any other data files associated with this user
        delete: (data, callback) => {
            // Check that the phone number is valid
            const phone =
                typeof data.queryStringObject.phone == 'string' &&
                data.queryStringObject.phone.trim().length == 10
                    ? data.queryStringObject.phone.trim()
                    : false;
            if (phone) {
                // Get the token from the header
                const token =
                    typeof data.headers.token == 'string'
                        ? data.headers.token
                        : false;
                // Verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
                    if (isTokenValid) {
                        read('users', phone, (err, data) => {
                            if (!err && data) {
                                deleteFile('users', phone, (err) => {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, {
                                            Error:
                                                'Could not delete specified user'
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
                        callback(403, {
                            Error:
                                'Missing requried token in header or token is invalid'
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

            if (phone && password) {
                // lookup the user who mathced that phone number
                read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        var hashedPassword = hash(password);
                        if (hashedPassword == userData.hashedPassword) {
                            // If valid, create a token with a random name. Set expiration, one hour into the future
                            const tokenId = createRandomString(20);
                            const expires = Date.now() + 1000 * 60 * 60;
                            const tokenObject = {
                                phone,
                                id: tokenId,
                                expires
                            };

                            // Store the token
                            create('tokens', tokenId, tokenObject, (err) => {
                                if (!err) {
                                    callback(200, tokenObject);
                                } else {
                                    callback(500, {
                                        Error: 'Could not create the new token'
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                Error: `Password did not match the specified user's password`
                            });
                        }
                    } else {
                        callback(400, {
                            Error: 'Could not find the specified user'
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        },
        // Required data: id
        // Optional data: none
        get: (data, callback) => {
            // Check that the id is valid
            const id =
                typeof data.queryStringObject.id == 'string' &&
                data.queryStringObject.id.trim().length == 20
                    ? data.queryStringObject.id.trim()
                    : false;
            if (id) {
                read('tokens', id, (err, tokenData) => {
                    if (!err && data) {
                        callback(200, tokenData);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        },

        // Required data: id, extend
        // Optional data: none
        put: (data, callback) => {
            const id =
                typeof data.payload.id == 'string' &&
                data.payload.id.trim().length == 20
                    ? data.payload.id.trim()
                    : false;
            const extend =
                typeof data.payload.extend == 'boolean' &&
                data.payload.extend == true
                    ? true
                    : false;
            if (id && extend) {
                read('tokens', id, (err, tokenData) => {
                    if (!err && tokenData) {
                        // Check to make sure the token isn't already epxired
                        if (tokenData.expires > Date.now()) {
                            tokenData.expires = Date.now() + 1000 * 60 * 60;

                            update('tokens', id, tokenData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        Error: `Could not update the token's expiration`
                                    });
                                }
                            });
                        } else {
                            callback(400, { Error: 'Token has expired' });
                        }
                    } else {
                        callback(400, {
                            Error: 'Specified token does not exist'
                        });
                    }
                });
            } else {
                callback(400, {
                    Error: 'Missing required field(s) or field(s) are invalid'
                });
            }
        },
        delete: (data, callback) => {
            // Check that the id is valid
            const id =
                typeof data.queryStringObject.id == 'string' &&
                data.queryStringObject.id.trim().length == 20
                    ? data.queryStringObject.id.trim()
                    : false;
            if (id) {
                read('tokens', id, (err, data) => {
                    if (!err && data) {
                        deleteFile('tokens', id, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {
                                    Error: 'Could not delete specified token'
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            Error: 'Could not find the specified token'
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required field' });
            }
        },

        // Verify if a token is currently valid for a given user
        verifyToken: (id, phone, callback) => {
            read('tokens', id, (err, tokenData) => {
                if (!err && tokenData) {
                    if (
                        tokenData.phone == phone &&
                        tokenData.expires > Date.now()
                    ) {
                        callback(true);
                    }
                } else {
                    callback(false);
                }
            });
        }
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
