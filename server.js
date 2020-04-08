'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors()); //middleware

app.get('/', (request, response) => {
  response.send('Home Page!');
});
// Add /location route
app.get('/location', locationHandler);

//Route Handler
function locationHandler(request, response) {
  const geoData = require('./data/geo.json');
  const city = request.query.city;
  const location = new Location(city, geoData);
  response.send(location);
}
//Route Handler for weather
app.get('/weather', weatherHandler);


function weatherHandler(request, response){
const weatherData = require('./data/darksky.json');
const weatherResults = [];
const city = request.query.city;
weatherData.daily.data.forEach(dailyWeather => {
  weatherResults.push(new Weather(dailyWeather))
});
response.send(weatherResults);
}
app.get('/bad', (request, response) => {
  throw new Error('whoopsie');
});
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
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time * 1000);
}
// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));