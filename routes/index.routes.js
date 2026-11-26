const router = require("express").Router();

const authRouter = require("./auth.routes")
router.use("/auth", authRouter)

const placesRouter = require("./places.routes")
router.use("/places", placesRouter)

module.exports = router;
