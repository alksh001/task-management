const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  password: {
     type: String,
     required: [true, 'Please provide a password'],
     minlength: 8,
     select: false
    },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
        validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords must be same'
        },
    },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'User'],
    default: 'User',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    },
  active: {
    type: Boolean,
    default: true,
    select: false
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();

});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})

userSchema.methods.correctPassowrd = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

module.exports = mongoose.model('User', userSchema);
