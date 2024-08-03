const express = require('express');

const app = express();

const { graphqlHTTP } = require('express-graphql');
const connectDB = require('./config/db');
const authMiddleware = require('./middlewares/auth');
const schema = require('./schemas');
require('dotenv').config();

// const { graphql } = require('graphql');

// connect database
connectDB();

// Init middleware
app.use(express.json());
// app.use(authMiddleware.protect);

app.use('/graphql', graphqlHTTP((req, res) => ({
  schema,
  context: { req, res },
  graphiql: true
})));

module.exports = app;
