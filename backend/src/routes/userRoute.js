const { Router } = require("express");
const { getUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.get("/profile", authMiddleware, getUser);

module.exports = router;
