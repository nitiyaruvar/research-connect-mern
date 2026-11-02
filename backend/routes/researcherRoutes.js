const express = require("express");
const { getResearcher, listResearchers } = require("../controllers/researcherController");

const router = express.Router();
router.get("/", listResearchers);
router.get("/:id", getResearcher);

module.exports = router;
