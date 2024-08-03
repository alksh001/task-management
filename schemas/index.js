const { GraphQLSchema, GraphQLObjectType } = require('graphql');
const { userQueries,userMutations } = require('./user');
const { taskQueries, taskMutations } = require('./tasks');
const { organizationQueries, organizationMutations } = require('./organizations');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
      ...taskQueries,
      ...userQueries,
      ...organizationQueries
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...userMutations,
      ...taskMutations,
    ...organizationMutations
    
  },
  // context: { req, res }, // Pass req and res to the context
  // graphiql: true
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
