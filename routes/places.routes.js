const router = require("express").Router();

const { isValidObjectId } = require("mongoose");

const { verifyToken } = require("../middlewares/auth.middlewares");

const Place = require("../models/Place.model");
const Review = require("../models/Review.model");

// POST "/api/places" => creates a new place. The person who creates it is the logged in user.
router.post("/", verifyToken, async (req, res, next) => {
  if (!req.body) {
    res.status(400).json({ message: "Body not received" });
    return;
  }

  const { name, description, latitude, longitude, type, features, visited, imageUrl } = req.body;

  //* Backend validations

  if (!name || !type) {
    res.status(400).json({ message: "Please give the place a name and choose a type" });
    return;
  }

  // the location comes from the pin on the map.
  // latitude or longitude can be 0, and !0 would be true, so I check if they are missing (undefined)
  if (latitude === undefined || longitude === undefined) {
    res.status(400).json({ message: "Please tap the map to choose where the place is" });
    return;
  }

  try {
    const newPlace = await Place.create({
      name,
      description,
      latitude,
      longitude,
      type,
      features,
      visited,
      imageUrl,
      createdBy: req.payload._id, // taking the user from the token, never from the form
    });

    res.status(201).json(newPlace);
  } catch (error) {
    // if the data breaks a rule from the model, like an unlisted type, they get 400 with the message, because they as the user can fix it
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      res.status(400).json({ message: firstError.message });
      return;
    }
    next(error);
  }
});

// GET "/api/places" => sends all the places. It can also filter them
router.get("/", async (req, res, next) => {
  const { type, features, visited, search } = req.query;

  // I only add to the filter the things that come in the query
  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (features) {
    filter.features = { $all: features.split(",") };
  }

  if (visited === "true" || visited === "false") {
    filter.visited = visited === "true";
  }

  // bulet proofing search against user entry typos or special characters
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: safeSearch, $options: "i" };
  }

  try {
    const places = await Place.find(filter).sort({ createdAt: -1 });
    res.status(200).json(places);
  } catch (error) {
    next(error);
  }
});

// this route goes before "/:placeId", if not, express thinks "mine" is a placeId
// GET "/api/places/mine" => sends only the places created by the logged in user
router.get("/mine", verifyToken, async (req, res, next) => {
  try {
    const places = await Place.find({ createdBy: req.payload._id }).sort({ createdAt: -1 });
    res.status(200).json(places);
  } catch (error) {
    next(error);
  }
});

// GET "/api/places/:placeId" => sends the details of one place, with the username of who created it
router.get("/:placeId", async (req, res, next) => {
  const { placeId } = req.params;

  if (!isValidObjectId(placeId)) {
    res.status(400).json({ message: "Sorry, this place link is not valid" });
    return;
  }

  try {
    const place = await Place.findById(placeId).populate("createdBy", "username");

    if (!place) {
      res.status(404).json({ message: "Sorry, we couldn't find this place" });
      return;
    }

    res.status(200).json(place);
  } catch (error) {
    next(error);
  }
});

// PUT "/api/places/:placeId" => edits a place. Only the user who created it can edit it.
router.put("/:placeId", verifyToken, async (req, res, next) => {
  const { placeId } = req.params;

  if (!isValidObjectId(placeId)) {
    res.status(400).json({ message: "Sorry, this place link is not valid" });
    return;
  }

  if (!req.body) {
    res.status(400).json({ message: "Body not received" });
    return;
  }

  const { name, description, latitude, longitude, type, features, visited, imageUrl } = req.body;

  //* Backend validations
  if (!name || !type) {
    res.status(400).json({ message: "Please give the place a name and choose a type" });
    return;
  }

  // the location comes from the pin on the map.
  // latitude or longitude can be 0, and !0 would be true, so I check if they are missing (undefined)
  if (latitude === undefined || longitude === undefined) {
    res.status(400).json({ message: "Please tap the map to choose where the place is" });
    return;
  }

  try {
    const place = await Place.findById(placeId);

    if (!place) {
      res.status(404).json({ message: "Sorry, we couldn't find this place" });
      return;
    }

    // check if the place is mine. createdBy is an ObjectId and the _id in the token is a text,
    // so I turn createdBy into text with toString() before comparing them
    if (place.createdBy.toString() !== req.payload._id) {
      res.status(403).json({ message: "You can only edit places you added" });
      return;
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      placeId,
      { name, description, latitude, longitude, type, features, visited, imageUrl }, // createdBy is not here, so nobody can change who created the place
      { returnDocument: "after", runValidators: true } // runValidators makes the model rules also work when editing
    );

    res.status(200).json(updatedPlace);
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      res.status(400).json({ message: firstError.message });
      return;
    }
    next(error);
  }
});

// DELETE "/api/places/:placeId" => deletes a place and all its reviews. Only the user who created it can delete it.
router.delete("/:placeId", verifyToken, async (req, res, next) => {
  const { placeId } = req.params;

  if (!isValidObjectId(placeId)) {
    res.status(400).json({ message: "Sorry, this place link is not valid" });
    return;
  }

  try {
    const place = await Place.findById(placeId);

    if (!place) {
      res.status(404).json({ message: "Sorry, we couldn't find this place" });
      return;
    }

    if (place.createdBy.toString() !== req.payload._id) {
      res.status(403).json({ message: "You can only delete places you added" });
      return;
    }

   // when a place is deleted, its reviews are deleted too 
    await Review.deleteMany({ place: placeId });
    await Place.findByIdAndDelete(placeId);

    res.status(200).json({ message: "The place and its reviews were deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
