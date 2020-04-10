const superagent = require('superagent');
const errorHandler = require('../util/error');

function movieHandler(response) {
    let movie = {

        title: "Sleepless in Seattle",
        overview: "A young boy who tries to set his dad up on a date after the death of his mother. He calls into a radio station to talk about his dad’s loneliness which soon leads the dad into meeting a Journalist Annie who flies to Seattle to write a story about the boy and his dad. Yet Annie ends up with more than just a story in this popular romantic comedy.",
        average_votes: "6.60",
        total_votes: "881",
        image_url: "https://image.tmdb.org/t/p/w500/afkYP15OeUOD0tFEmj6VvejuOcz.jpg",
        popularity: "8.2340",
        released_on: "1993-06-24"
    
    }
    response.send(movie);

}

module.exports = movieHandler;