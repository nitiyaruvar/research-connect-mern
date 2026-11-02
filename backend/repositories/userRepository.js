const User = require("../models/User");

const userRepository = {
  findById(id) {
    return User.findById(id);
  },
  findByIdentity(identity) {
    const normalized = identity.trim().toLowerCase();
    return User.findOne({ $or: [{ email: normalized }, { username: normalized }] });
  },
  create(attributes) {
    return User.create(attributes);
  },
  update(id, attributes) {
    return User.findByIdAndUpdate(id, attributes, { new: true, runValidators: true });
  },
  delete(id) {
    return User.findByIdAndDelete(id);
  },
};

module.exports = userRepository;
