const { Schema, model } = require("mongoose");

const placeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [3, 'Name must have at least 3 characters.'],
      maxlength: [60, 'Name can have max 60 characters.']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description can have max 1000 characters.']
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required.'],
      min: [-90, 'Latitude must be between -90 and 90.'],
      max: [90, 'Latitude must be between -90 and 90.']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required.'],
      min: [-180, 'Longitude must be between -180 and 180.'],
      max: [180, 'Longitude must be between -180 and 180.']
    },
    type: {
      type: String,
      required: [true, 'Type is required.'],
      enum: ["beach", "lake", "river", "campsite", "overnight parking", "nature spot", "viewpoint"]
    },
    features: [
      {
        type: String,
        enum: ["dog friendly", "nudist", "overnight allowed", "drinking water", "toilets", "showers", "shade", "free", "electricity", "grey water dump", "black water dump", "good phone signal", "wifi", "supermarket nearby"]
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
