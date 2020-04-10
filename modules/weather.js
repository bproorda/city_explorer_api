
const superagent = require('superagent');
const errorHandler = require('../util/error');

function weatherHandler(request, response) {
    const latitude = request.query.latitude;
    const longitude = request.query.longitude;
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

  function Weather(weatherData) {
    this.forecast = weatherData.weather.description;
    this.time = new Date(weatherData.valid_date).toDateString();
  }

  module.exports = weatherHandler;