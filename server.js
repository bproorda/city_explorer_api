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

function trailHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const url = 'https://www.hikingproject.com/data/get-trails';
  superagent(url)
    .query({
      key: process.env.HIKING_KEY,
      lat: lat,
      lon: lon,
      format: 'json'

    })
    .then(trailsResponse => {
      let trailData = trailsResponse.body.trails;
      console.log(trailData);
      let trails = trailData.map(data => {
        return new Trail(data);
      })

      response.send(trails);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

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

function Location(city, geoData) {
  this.search_Query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);

}

function Trail(trailData) {
  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.trail_url;
  this.conditions = trailData.conditions;
  this.condition_date = new Date(trailData.conditionDate).toDateString();
  this.condition_time = new Date(trailData.conditionDate).toLocaleTimeString();
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

