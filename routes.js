// dependencies
const { sampleHandlers } = require('./handlers/routeHandlers/sampleHandlers');
const { userHandlers } = require('./handlers/routeHandlers/userHandler');

const routes = {
    sample: sampleHandlers,
    user: userHandlers,
};

module.exports = routes;
