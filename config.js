// Create and export configuration environments

// Container for all the environments

var environments = {
    // Staging (default) environment
    staging: {
        port: 3000,
        envName: 'staging'
    },
    // Production environment
    production: {
        port: 8000,
        envName: 'production'
    }
};

// Determine which should be exported on the basis of the command-line arguement

var currentEnvironment =
    typeof process.env.NODE_ENV == 'string'
        ? process.env.NODE_ENV.toLowerCase().trim()
        : '';

var environmentToExport =
    typeof environments[currentEnvironment] == 'object'
        ? environments[currentEnvironment]
        : environments.staging;

module.exports = environmentToExport;
