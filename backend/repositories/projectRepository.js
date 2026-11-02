const Project = require("../models/Project");

const projectRepository = {
  findMany(filter = {}, options = {}) {
    return Project.find(filter, null, options);
  },
  findById(id) {
    return Project.findById(id);
  },
  create(attributes) {
    return Project.create(attributes);
  },
  update(id, attributes) {
    return Project.findByIdAndUpdate(id, attributes, { new: true, runValidators: true });
  },
  delete(id) {
    return Project.findByIdAndDelete(id);
  },
};

module.exports = projectRepository;
