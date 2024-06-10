/*
Title: Raw Node.js Project - URL-Sentinel
Description: A REASTFul API to monitor up or down time of user defined links
Author: Naime Molla
Date: 18/05/24
*/

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');

// app object = module scaffolding
const app = {};

// Create server
app.createServer = () => {
    const server = http.createServer(handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Listening to port ${environment.port}`);
    });
};

// start server
app.createServer();
