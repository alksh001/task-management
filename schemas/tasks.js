// src/schemas/task.js
const Task = require('../models/task');
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');

const TaskType = new GraphQLObjectType({
    name: 'Task',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        dueDate: { type: GraphQLString },
        userId: { type: GraphQLID },
        organizationId: { type: GraphQLID }
    })
});


const taskQueries = {
    tasks: {
        type: new GraphQLList(TaskType),
        resolve: async (parent, args, context) =>
        {
            try
            {
                await new Promise((resolve, reject) =>
                {
                    auth.protect(context, context.res, (err) =>
                    {
                        if (err) reject(err);
                        else resolve();
                    });

                });
            } catch (err)
            {
                console.log(err);
                throw new Error(err)
            };
            return Task.find({ organizationId: context.user.organizationId });
        }
    }
};

const taskMutations = {
    createTask: {
        type: TaskType,
        args: {
            title: { type: new GraphQLNonNull(GraphQLString) },
            description: { type: GraphQLString },
            status: { type: GraphQLString },
            dueDate: { type: GraphQLString },
            userId: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: async (parent, args, context) =>
        {
            try
            {
                await new Promise((resolve, reject) =>
                {
                    auth.protect(context, context.res, (err) =>
                    {
                        //   console.log({err});
                        if (err) reject(err);
                        else resolve();
                    });

                });

                // Apply rbac middleware to check authorization
                await new Promise((resolve, reject) =>
                {
                    rbac.restricTo('Admin', 'Manager', 'User')(context, context.res, (err) =>
                    {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } catch (err)
            {
                throw new Error(err)
            };
            let task = new Task({
                title: args.title,
                description: args.description,
                status: args.status,
                dueDate: args.dueDate,
                userId: args.userId,
                organizationId: await context.user.organizationId
            });
            return task.save();
        }
    },
    updateTask: {
        type: TaskType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            title: { type: GraphQLString },
            description: { type: GraphQLString },
            status: { type: GraphQLString },
            dueDate: { type: GraphQLString }
        },
        resolve: async (parent, args, context) =>
        {
            try
            {
                await new Promise((resolve, reject) =>
                {
                    auth.protect(context, context.res, (err) =>
                    {
                        if (err) reject(err);
                        else resolve();
                    });

                });

                // Apply rbac middleware to check authorization
                await new Promise((resolve, reject) =>
                {
                    rbac.restricTo('Admin', 'Manager', 'User')(context, context.res, (err) =>
                    {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } catch (err)
            {
                console.log(err);
                throw new Error(err)
            };

            return Task.findOneAndUpdate(
                { _id: args.id, organizationId: context.user.organizationId },
                args,
                { new: true }
            );
        }
    },
    deleteTask: {
        type: TaskType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: async (parent, args, context) =>
        {
            try
            {
                await new Promise((resolve, reject) =>
                {
                    auth.protect(context, context.res, (err) =>
                    {
                        //   console.log({err});
                        if (err) reject(err);
                        else resolve();
                    });

                });

                // Apply rbac middleware to check authorization
                await new Promise((resolve, reject) =>
                {
                    rbac.restricTo('Admin', 'Manager', 'User')(context, context.res, (err) =>
                    {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } catch (err)
            {
                throw new Error(err)
            };
            return Task.findOneAndRemove({ _id: args.id, organizationId: context.user.organizationId });
        }
    }
};

module.exports = { taskQueries, taskMutations };
