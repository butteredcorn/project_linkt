// const express = require('express')
// const path = require('path')
// const React = require('react')
// const ReactDOMServer = require('react-dom/server')
// const App = require('./src/App')

const app = require('./app')();
const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server is running on ${port}.`)
})