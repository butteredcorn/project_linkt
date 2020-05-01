require("@babel/polyfill")
require('ignore-styles')

require('@babel/register')({
    ignore: [/(node_module)/],
    presets: ['@babel/preset-env', '@babel/preset-react']
})

require('./server')

//api style react scripts
// "client": "cd react-app && npm start",
    // "server": "nodemon server.js",
    // "start": "concurrently --kill-others-on-fail \"nodemon server.js\" \"cd react-app && npm start\""