const express = require("express");

// Logs incoming requests and responses to the terminal (useful for debugging)
const logger = require("morgan");

// Allows the server to accept requests from different origins (e.g., frontend apps)
// CORS (Cross-Origin Resource Sharing) enables secure cross-origin requests.
const cors = require("cors");

// Middleware configuration
function config(app) {
  // Enables Express to trust reverse proxies (e.g., when deployed behind services like Heroku or Vercel)
  app.set("trust proxy", 1);
  
  // Configures CORS to allow requests only from the specified origin
  app.use(
    cors({
      origin: [process.env.ORIGIN]
    })
  );
  
  // Logs requests in the development environment
  app.use(logger("dev")); 

  // Parses incoming JSON requests
  app.use(express.json()); 

  // Parses incoming request bodies with URL-encoded data (form submissions)
  app.use(express.urlencoded({ extended: false }));
};

module.exports = config