const express = require('express');
const { ApolloServer, gql, AuthenticationError } = require('apollo-server-express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// import typedefs and resolvers
const filePath = path.join(__dirname, 'typeDefs.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');
const resolvers = require('./resolvers');

// import enviroment variables and mongoose models
require('dotenv').config({ path: 'variables.env' });
const User = require('./models/User.js');
const ChatRoom = require('./models/ChatRoom.js');

// connect to mongo db atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log('DB connected'))
  .catch(err => console.error(err));

// verify jwt token passed from client
const getUser = async token => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
      console.log(user);
    } catch (err) {
      throw new AuthenticationError('Your session has ended. Please sign in again');
    };
  };
};

// The ApolloServer constructor requires two parameters: your schema
// Create Apollo/GraphQL Server using typeDefs, resolvers, and context object
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: error => ({
    name: error.name,
    message: error.message.replace('Context creation failed: ', '')
  }),
  context: async ({ req }) => {
    const token = req.headers['authorization'];
    return { User, ChatRoom, currentUser: await getUser(token) };
  }
});

// add express to apolloServer
const app = express();
server.applyMiddleware({ app });

// the `listen` method launches a web server
app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);