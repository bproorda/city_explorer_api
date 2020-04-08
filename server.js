'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

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
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;
  const url = 'https://www.hikingproject.com/data/get-trails';
  superagent(url)
  .query({
    key: process.env.HIKING_KEY,
    lat: latitude,
    lon: longitude,
    
  })
  .then(trailsResponse => {
    let trailData = trailResponse.body;
    console.log(trailData);
  })
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
  // this.time = new Date(weatherData.valid_date);
   this.time = weatherData.valid_date;
  //  this.time = new Date(weatherData.ob_time);

}
// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));