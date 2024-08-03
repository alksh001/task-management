const jwt = require('jsonwebtoken');
const User = require('../models/users');
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.protect = catchAsync(async (context, res, next) =>
{
    // 1) Getting token and check if it's there
    const { req } = context
    let token;
    if (req.rawHeaders[3].startsWith('Bearer'))
    {
        token = req.rawHeaders[3].split(' ')[1];
    }

    if (!token)
    {
        return next(new AppError('You are not logged in! Please log in to get access.', 401))
    }

    // Verifying Token

    const decoded = await new Promise((resolve, reject) =>
    {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) =>
        {
            if (err)
            {
                return reject(err);
            }
            resolve(decoded);
        });
    });

    // Check If user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
    {
        return next(new AppError("The user belongs to this token does no longer exist", 401));
    }

    context.user = currentUser;

    next();
});
