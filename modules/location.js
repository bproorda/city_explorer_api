'use strict';

const superagent = require('superagent');
const client = require('../util/db');
const errorHandler = require('../util/error');
//getting location from database...hopefully
function getLocationFromDB(city) {
    const SQL = 'SELECT * FROM locations WHERE search_query = $1';
    const sqlParameters = [city];
    return client.query(SQL, sqlParameters)
      .then(result => {
        if (result.rowCount > 0) {
          return (result.rows[0]);
        }
        else {
          return null;
        }
      }).catch(err => {
        console.log(err);
        errorHandler(err, request, response);
      });
  }
  
  
  //Route Handler for location
  function locationHandler(request, response) {
    const city = request.query.city;
    const url = 'https://us1.locationiq.com/v1/search.php';
    getLocationFromDB(city).then(location => {
      if (location) {
        console.log('Location from database', location);
        return location;
      } else {
        return getLocationFromAPI(city);
      }
    }).then(result => {
      response.send(result);
    }).catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
  }
  
  //Using api to get location
  function getLocationFromAPI(city) {
    console.log('requesting info from api');
    const url = 'https://us1.locationiq.com/v1/search.php';
    return superagent.get(url)
      .query({
        key: process.env.GEO_KEY,
        q: city,
        format: 'json'
      })
      .then(locationResponse => {
        let geoData = locationResponse.body;
        const location = new Location(city, geoData);
        setLocationInDB(location);
        return location;
      }).catch(err => {
        console.log(err);
        errorHandler(err, request, response);
      });
  }
  
  function setLocationInDB(location) {
    const SQL2 = 'INSERT INTO locations(search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
    const sqlParameters2 = [location.search_Query, location.formatted_query, location.latitude, location.longitude];
    client.query(SQL2, sqlParameters2).then(result => {
      console.log('location cached', result);
    }).catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
  }
  function Location(city, geoData) {
    this.search_Query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = parseFloat(geoData[0].lat);
    this.longitude = parseFloat(geoData[0].lon);
  
  }

  module.exports = locationHandler;