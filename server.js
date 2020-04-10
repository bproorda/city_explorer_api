'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const locationHandler = require('./modules/location');
const weatherHandler = require('./modules/weather');
const trailHandler = require('./modules/hiking');
const client = require('./util/db');


// Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors()); //middleware

app.get('/', (request, response) => {
  response.send('Home Page!');
});
// location route
app.get('/location', locationHandler);


//Route Handler for weather
app.get('/weather', weatherHandler);

app.get('/bad', (request, response) => {
  throw new Error('whoopsie');
});


//route for hiking trails
app.get('/trails', trailHandler);

//has to happen after error has occured
app.use(errorHandler); // Error Middleware
app.use(notFoundHandler);
// Helper functions

function errorHandler(error, request, response, next) {
  response.status(500).json({
    error: true,
    message: error.message,
  });
}
function notFoundHandler(request, response) {
  response.status(404).json({
    notFound: true,
  });
}

// Make sure the server is listening for requests after connecting to Database first
client.connect()
  .then(() => {
    console.log('PG connected!');
    app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
  })
  .catch(err => {
    throw `PG ERROR! : ${err.message}`
  });

