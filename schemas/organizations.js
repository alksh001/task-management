// src/schemas/organization.js
const Organization = require('../models/organization');
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList } = require('graphql');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac')

const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString }
  })
});

const organizationQueries = {
  organizations: {
    type: new GraphQLList(OrganizationType),
    resolve(parent, args) {
      return Organization.find({});
    }
  }
};

const organizationMutations = {
  createOrganization: {
    type: OrganizationType,
    args: {
      name: { type: GraphQLString }
    },
    resolve: async (parent, args, context) => {
        // Apply protect middleware to check authentication
        // console.log("Org Context", context);
      try {
        await new Promise((resolve, reject) => {
            auth.protect(context.req, context.res, (err) =>
            {
            //   console.log({err});
            if (err) reject(err);
                else resolve();
          });
        });

        // Apply rbac middleware to check authorization
        await new Promise((resolve, reject) => {
          rbac.restricTo('Admin')(context.req, context.res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Create the organization if authentication and authorization passed
        let organization = new Organization({
          name: args.name
        });

        return organization.save();
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }
};

module.exports = { organizationQueries, organizationMutations };
