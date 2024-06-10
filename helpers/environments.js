// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'sfsdgdfhfdgjhdsf',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12298007899',
        accountSid: 'AC1a0ce36eb41c8ae1febed3f25724fa21',
        authToken: '7c6a7d79d21376f1f6f1652aed5274cc',
    },
};

environments.production = {
    port: 5000,
    ennName: 'production',
    secretKey: 'sdfsgftrfffrrgghyt',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12298007899',
        accountSid: 'AC1a0ce36eb41c8ae1febed3f25724fa21',
        authToken: '7c6a7d79d21376f1f6f1652aed5274cc',
    },
};

// determine which environment was passed
const currentEnvironment =    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentsToExport =    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

// export module
module.exports = environmentsToExport;
