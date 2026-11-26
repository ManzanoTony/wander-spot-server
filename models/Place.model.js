const { Schema, model } = require("mongoose");

const placeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please give the place a name.'],
      trim: true,
      minlength: [3, 'The name needs at least 3 characters.'],
      maxlength: [60, 'The name can have up to 60 characters.']
    },
    description: {
      type: String,
      maxlength: [1000, 'The description can have up to 1000 characters.']
    },
    latitude: {
      type: Number,
      required: [true, 'Please tap the map to choose where the place is.'],
      min: [-90, 'This location is not valid, please tap the map again.'],
      max: [90, 'This location is not valid, please tap the map again.']
    },
    longitude: {
      type: Number,
      required: [true, 'Please tap the map to choose where the place is.'],
      min: [-180, 'This location is not valid, please tap the map again.'],
      max: [180, 'This location is not valid, please tap the map again.']
    },
    type: {
      type: String,
      required: [true, 'Please choose a type.'],
      enum: {
        values: ["beach", "lake", "river", "campsite", "overnight parking", "nature spot", "viewpoint"],
        message: 'Please choose a type from the list.'
      }
    },
    features: [
      {
        type: String,
        enum: {
          values: ["dog friendly", "nudist", "overnight allowed", "drinking water", "toilets", "showers", "shade", "free", "electricity", "grey water dump", "black water dump", "good phone signal", "wifi", "supermarket nearby"],
          message: 'Please choose features from the list.'
        }
      }
    ],
    visited: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'Creator is required.']
    }
  },
  {
    timestamps: true
  }
);

const Place = model("Place", placeSchema);

module.exports = Place;
