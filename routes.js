// dependencies
const { sampleHandlers } = require('./handlers/routeHandlers/sampleHandlers');
const { userHandlers } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');

const routes = {
    sample: sampleHandlers,
    user: userHandlers,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
