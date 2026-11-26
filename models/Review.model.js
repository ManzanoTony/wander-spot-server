const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be between 1 and 5.'],
      max: [5, 'Rating must be between 1 and 5.'],
      // only whole numbers are allowed (no 3.5 stars, so no decimals)
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number.'
      }
    },
    comment: {
      type: String,
      required: [true, 'Comment is required.'],
      trim: true,
      minlength: [3, 'Comment must have at least 3 characters.'],
      maxlength: [500, 'Comment can have max 500 characters.']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'Author is required.']
    },
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: [true, 'Place is required.']
    }
  },
  {
    timestamps: true
  }
);

const Review = model("Review", reviewSchema);

module.exports = Review;
