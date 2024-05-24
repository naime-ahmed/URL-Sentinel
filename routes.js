// dependencies
const { sampleHandlers } = require('./handlers/routeHandlers/sampleHandlers');
const { userHandlers } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');

const routes = {
    sample: sampleHandlers,
    user: userHandlers,
    token: tokenHandler,
};

module.exports = routes;
