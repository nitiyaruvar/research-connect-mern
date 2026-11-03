const express = require("express");
const { createUpload, deleteUpload, listUploads } = require("../controllers/uploadController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.get("/", requireAuth, listUploads);
router.post("/", requireAuth, createUpload);
router.delete("/:id", requireAuth, deleteUpload);

module.exports = router;
