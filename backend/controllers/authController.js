const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

 try {

  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
   return res.status(400).json("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
   name,
   email,
   password: hashedPassword,
   role
  });

  await user.save();

  res.json("User registered successfully");

 } catch (error) {
  res.status(500).json(error.message);
 }

};

exports.login = async (req, res) => {

 try {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
   return res.status(400).json("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
   return res.status(400).json("Invalid credentials");
  }

  const token = jwt.sign(
   { id: user._id, role: user.role },
   process.env.JWT_SECRET,
   { expiresIn: "1d" }
  );

  res.json({
   token,
   user: {
    id: user._id,
    name: user.name,
    role: user.role
   }
  });

 } catch (error) {
  res.status(500).json(error.message);
 }

};