'use strict';

const superagent = require('superagent');

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

module.exports = trailHandler;