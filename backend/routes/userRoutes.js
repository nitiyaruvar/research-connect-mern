const express = require("express");
const { createUser, getUsers, updateUser } = require("../controllers/userController");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
router.route("/").get(getUsers).post(createUser);
router.route("/:id").put(updateUser);

module.exports = router;