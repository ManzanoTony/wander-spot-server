const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = require("express").Router();

const { verifyToken } = require("../middlewares/auth.middlewares");

const User = require("../models/User.model");

// POST "/api/auth/signup" => receive the user credentials and create the user document.
router.post("/signup", async (req, res) => {
  console.log(req.body);

  if (!req.body) {
    res.status(400).json({ message: "Body not received" });
    return;
  }

  const { email, password, username } = req.body;

  if (!username || !email || !password) {
    res
      .status(400)
      .json({ message: "Username, Email and Password are required" });
    return;
  }

  if (username.trim().length < 3 || username.trim().length > 20) {
    res.status(400).json({
      message: "Username needs min 3 characters and max 20 characters",
    });
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{6,20}$/;
  if (passwordRegex.test(password) === false) {
    res.status(400).json({
      message:
        "Password not strong enough. Needs min 6 characters, max 20 characters, at least one uppercase, one lowercase and one number",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email) === false) {
    res.status(400).json({ message: "Email format not valid" });
    return;
  }

  const foundUser = await User.findOne({ email: email });
  if (foundUser) {
    res
      .status(400)
      .json({ message: "User already registered with that email" });
    return;
  }

  const foundUsername = await User.findOne({ username: username });
  if (foundUsername) {
    res.status(400).json({ message: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = {
    email: email,
    password: passwordHash,
    username: username,
  };

  await User.create(newUser);
  res.status(201).json({ message: "User created" });
});

// POST "/api/auth/login" => receive the user credentials to authenticate the user. Also create and send the Auth Token.
router.post("/login", async (req, res) => {
  console.log(req.body);

  if (!req.body) {
    res.status(400).json({ message: "Body not received" });
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and Password are required" });
    return;
  }

  const foundUser = await User.findOne({ email: email });
  console.log(foundUser);
  if (!foundUser) {
    res.status(400).json({ message: "User not found with that email" });
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    res.status(400).json({ message: "Password not correct" });
    return;
  }

  const payload = {
    _id: foundUser._id,
    email: foundUser.email,
    username: foundUser.username,
  };

  const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({ authToken, payload });
});

// GET "/api/auth/verify" => receiving and validating the Auth Token and sending the user info to the frontend.
router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json(req.payload);
});

module.exports = router;
