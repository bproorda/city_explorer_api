'use strict';

const superagent = require('superagent');

function yelpHandler(request, response) {
    const latitude = request.query.latitude;
    const longitude = request.query.longitude;
    const url = 'https://api.yelp.com/v3/businesses/search';
    superagent.get(url)
    .set('Authorization', 'Bearer ' + process.env.YELP_KEY)
      .query({
        latitude: latitude,
        longitude: longitude,
        catergories: 'restaurants',
      }).then(yelpResponse => {
          let yelpData = yelpResponse.body.businesses;
          console.log(yelpData);
          let yelp = yelpData.map(data => {
            return new Business(data);
      })
      response.send(yelp);
    }).catch(err => {
        console.log(err);
        errorHandler(err, request, response);
      });
}

function Business(yelpData) {
    this.name = yelpData.name;
    this.price = yelpData.price;
    this.rating = yelpData.rating;
    this.image_url = yelpData.image_url;
    this.url = yelpData.url;
}



module.exports = yelpHandler;