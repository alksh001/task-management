const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLString, GraphQLNonNull } = require('graphql');
const { signToken } = require('../utils/jwt');
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const auth = require('../middlewares/auth');

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    role: { type: GraphQLString },
    organizationId: { type: GraphQLID }
  })
});

const userQueries = {
  users: {
    type: new GraphQLList(UserType),
    resolve(parent, args, context) {
      if (!context.user) {
        throw new AppError('Authentication required',401);
      }
      return User.find({ organizationId: context.user.organizationId });
    }
  }
};

const userMutations = {
  signup: {
    type: UserType,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      passwordConfirm: { type: new GraphQLNonNull(GraphQLString) },
      role: { type: GraphQLString },
      organizationId: { type: GraphQLID }
      
    },
    async resolve(parent, args, context, info) {
      const newUser = new User({
        username: args.username,
        password: args.password,
        passwordConfirm: args.passwordConfirm,
        role: args.role,
        organizationId: args.organizationId
      });

      await newUser.save();
        const token = signToken(newUser._id);
        console.log({token});

        return {
            id: newUser._id,
            username: newUser.username,
            role: newUser.role,
            token: token
        };
    }
  },
  login: {
    type: GraphQLString,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) }
    },
    async resolve(parent, args, context, info) {
      const { username, password } = args;
      if (!username || !password) {
        throw new AppError('Please provide email and password!', 401);
      }

      const user = await User.findOne({ username }).select('+password');

      if (!user || !await user.correctPassowrd(password, user.password)) {
        throw new AppError('Incorrect email or password', 401);
      }

      const token = signToken(user._id);
      return token;
    }
    },
    updateUser: {
    protect : auth.protect,
    type: UserType,
      args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      username: { type: GraphQLString },
      password: { type: GraphQLString }
    },
    resolve(parent, args, context) {
      if (!context.user) {
        throw new Error('Authentication required');
        }
        // auth.protect
      return Task.findOneAndUpdate(
        { _id: args.id, organizationId: context.user.organizationId },
        args,
        { new: true }
      );
    }
  },
   deleteUser: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) }
    },
    async resolve(parent, args, context) {
      if (!context.user) {
        throw new AppError('Authentication required', 401);
      }
      return Task.findByIdAndUpdate({ _id: args.id },{active: false });
    }
  }
};

module.exports = {userQueries, userMutations };
