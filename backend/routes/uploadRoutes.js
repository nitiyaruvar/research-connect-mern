const express = require("express");
const { createUpload, deleteUpload } = require("../controllers/uploadController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.post("/", requireAuth, createUpload);
router.delete("/:id", requireAuth, deleteUpload);

module.exports = router;
