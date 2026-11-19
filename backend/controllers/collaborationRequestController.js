const CollaborationRequest = require("../models/CollaborationRequest");

async function createCollaborationRequest(req, res) {
  try {
    const request = await CollaborationRequest.create({ ...req.body, sender: req.user._id });
    const savedRequest = await request.populate([
      { path: "sender", select: "name email department" },
      { path: "recipient", select: "name email department" },
      { path: "project", select: "title status" },
    ]);

    res.status(201).json(savedRequest);
  } catch (error) {
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({
      message: "Unable to create collaboration request",
      error: error.message,
    });
  }
}

async function getCollaborationRequests(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.recipient) filter.recipient = req.query.recipient;
    if (req.query.sender) filter.sender = req.query.sender;
    if (req.query.project) filter.project = req.query.project;

    const requests = await CollaborationRequest.find(filter)
      .populate("sender", "name email department")
      .populate("recipient", "name email department")
      .populate("project", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({
      message: "Unable to fetch collaboration requests",
      error: error.message,
    });
  }
}

async function updateCollaborationRequest(req, res) {
  try {
    const existingRequest = await CollaborationRequest.findOne({
      _id: req.params.id,
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    });
    if (!existingRequest) {
      return res.status(404).json({ message: "Collaboration request not found" });
    }

    const updates = { ...req.body };
    delete updates.sender;
    delete updates.recipient;
    const request = await CollaborationRequest.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("sender", "name email department")
      .populate("recipient", "name email department")
      .populate("project", "title status");

    if (!request) {
      return res.status(404).json({ message: "Collaboration request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({ message: "Unable to update collaboration request", error: error.message });
  }
}

module.exports = { createCollaborationRequest, getCollaborationRequests, updateCollaborationRequest };