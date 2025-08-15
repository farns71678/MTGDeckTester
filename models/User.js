const mongoose = require('mongoose');
//const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const { default: isEmail } = require('validator/lib/isEmail');

const collectionCardSchema = new mongoose.Schema({
  count: { type: Number },
  scryfallId: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter a username. "],
        unique: true
        /*validate: [(val) => {}, "Please enter a valid email. "]*/
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [10, "Min length 10 characters. "],
    },
    email: {
      type: String,
      required: [true, "Please enter an email. "],
      unique: true,
      validate: [(val) => isEmail(val), "Please enter a valid email. "]
    },
    decks: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    cardCollection: {
      type: [collectionCardSchema]
    }
});

// fire a function before doc is saved
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect username');
};

const User = mongoose.model('user', userSchema);

module.exports = User;