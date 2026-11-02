const CollaborationRequest = require("../models/CollaborationRequest");

const collaborationRepository = {
  findMany(filter = {}, options = {}) {
    return CollaborationRequest.find(filter, null, options);
  },
  findById(id) {
    return CollaborationRequest.findById(id);
  },
  create(attributes) {
    return CollaborationRequest.create(attributes);
  },
  update(id, attributes) {
    return CollaborationRequest.findByIdAndUpdate(id, attributes, { new: true, runValidators: true });
  },
  delete(id) {
    return CollaborationRequest.findByIdAndDelete(id);
  },
};

module.exports = collaborationRepository;
