const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {

     username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must have at least 3 characters.'],
      maxlength: [20, 'Username can have max 20 characters.']
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    }
  },
  {
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
