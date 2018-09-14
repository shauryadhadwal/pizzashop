const environments = {
    default: {
        environment: 'default',
        httpPort: 3000,
        httpsPort: 3001,
        hashingSecret: 'qwerty',
        stripe: {
            secret: 'use your own key'
        },
        mailgun: {
            api: 'use your own key'
        },
        templateGlobals: {
            appName: 'Pizza Online',
            companyName: 'NotARealCompany, Inc.',
            yearCreated: '2018',
            baseUrl: 'http://localhost:3000/'
        }
    },
    development: {
        environment: 'development',
        httpPort: 3000,
        httpsPort: 3001,
        hashingSecret: 'qwerty',
        stripe: {
            secret: 'use your own key'
        },
        mailgun: {
            api: 'use your own key'
        },
        templateGlobals: {
            'appName': 'Pizza Online',
            'companyName': 'NotARealCompany, Inc.',
            'yearCreated': '2018',
            'baseUrl': 'http://localhost:3000/'
        }
    },
    production: {
        environment: 'production',
        httpPort: 3000,
        httpsPort: 3001,
        hashingSecret: 'qwerty',
        stripe: {
            secret: 'use your own key'
        },
        mailgun: {
            api: 'use your own key'
        },
        templateGlobals: {
            'appName': 'Pizza Online',
            'companyName': 'NotARealCompany, Inc.',
            'yearCreated': '2018',
            'baseUrl': 'http://localhost:3000/'
        }
    }
};

const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'use your own key';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.default;

module.exports = environmentToExport;