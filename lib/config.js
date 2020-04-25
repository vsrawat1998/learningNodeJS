// Create and export configuration environments

// Container for all the environments

const environments = {
    // Staging (default) environment
    staging: {
        httpPort: 3000,
        httpsPort: 3001,
        envName: 'staging',
        hashingSecret: 'thisIsASecret'
    },
    // Production environment
    production: {
        httpPort: 8000,
        httpsPort: 8001,
        envName: 'production',
        hashingSecret: 'thisIsABigSecret'
    }
};

// Determine which should be exported on the basis of the command-line arguement

const currentEnvironment =
    typeof process.env.NODE_ENV == 'string'
        ? process.env.NODE_ENV.toLowerCase().trim()
        : '';

const environmentToExport =
    typeof environments[currentEnvironment] == 'object'
        ? environments[currentEnvironment]
        : environments.staging;

export const {
    httpPort,
    httpsPort,
    envName,
    hashingSecret
} = environmentToExport;
