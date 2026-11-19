const User = require("../models/User");

async function createUser(req, res) {
  try {
    const user = await User.create(req.body);
    const publicUser = user.toObject();
    delete publicUser.password;
    res.status(201).json(publicUser);
  } catch (error) {
    const statusCode = error.name === "ValidationError" || error.code === 11000 ? 400 : 500;
    res.status(statusCode).json({ message: "Unable to create user", error: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find().select("name email department role").sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch users", error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    Object.assign(user, req.body);
    await user.save();
    const publicUser = user.toObject();
    delete publicUser.password;
    res.status(200).json(publicUser);
  } catch (error) {
    const statusCode = error.name === "ValidationError" || error.name === "CastError" || error.code === 11000 ? 400 : 500;
    res.status(statusCode).json({ message: "Unable to update user", error: error.message });
  }
}

module.exports = { createUser, getUsers, updateUser };