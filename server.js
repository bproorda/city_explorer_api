'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

//Database connection setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

// Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors()); //middleware

app.get('/', (request, response) => {
  response.send('Home Page!');
});
// Add /location route
app.get('/location', locationHandler);

//Route Handler for location
function locationHandler(request, response) {
  // const geoData = require('./data/geo.json');
  const city = request.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.GEO_KEY,
      q: city,
      format: 'json'
    })
    .then(locationResponse => {
      let geoData = locationResponse.body;
      console.log(geoData);
      const location = new Location(city, geoData);
      response.send(location);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}
//Route Handler for weather
app.get('/weather', weatherHandler);


function weatherHandler(request, response) {
  // const weatherData = require('./data/darksky.json');
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;
  // const weatherResults = [];
  const city = request.query.city;
  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';
  superagent.get(url)
    .query({
      lat: latitude,
      lon: longitude,
      key: process.env.WEATHER_KEY,

    }).then(weatherResponse => {
      let weatherData = weatherResponse.body;
      console.log(weatherData);
      let dailyResults = weatherData.data.map(dailyWeather => {
        return new Weather(dailyWeather);
      });
      response.send(dailyResults);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}
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
function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = new Date(weatherData.valid_date).toDateString();
  //  this.time = weatherData.valid_date;
  //  this.time = new Date(weatherData.ob_time);

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
  .catch( err => {
    throw `PG ERROR! : ${err.message}`
  });

