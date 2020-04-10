'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const errorHandler = require('./util/error');
const locationHandler = require('./modules/location');
const weatherHandler = require('./modules/weather');
const trailHandler = require('./modules/hiking');
const yelpHandler = require('./modules/yelp');
const client = require('./util/db');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors()); //middleware

//routes
app.get('/', (request, response) => {
  response.send('Home Page!');
});
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.get('/yelp', yelpHandler);
app.get('/bad', (request, response) => {
  throw new Error('whoopsie');
});

//has to happen after error has occured
app.use(errorHandler); // Error Middleware
app.use(notFoundHandler);

// Helper functions

function notFoundHandler(request, response) {
  response.status(404).json({
    notFound: true,
  });
}

// Connecting to Database and then Port
client.connect()
  .then(() => {
    console.log('PG connected!');
    app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
  })
  .catch(err => {
    throw `PG ERROR! : ${err.message}`
  });

