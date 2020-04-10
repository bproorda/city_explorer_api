
'use strict';

function errorHandler(error, request, response, next) {
    response.status(500).json({
      error: true,
      message: error.message,
    });
  }
  module.exports = errorHandler;