/*
Title: Uptime Monitoring Application
Description: A REASTFul API to monitor up or down time of user defined links
Author: Naime Molla
Date: 18/05/24
*/

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');

// app object = module scaffolding
const app = {};

// configuration
app.config = {
    port: 3000,
};

// Create server
app.createServer = () => {
    const server = http.createServer(handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`Listening to port ${app.config.port}`);
    });
};

// start server
app.createServer();
