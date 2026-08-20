const { Router } = require("express");
const { signupUser, loginUser } = require("../controllers/authController");

const router = Router();

router.post("/signup", signupUser);
router.post("/login",loginUser)

module.exports = router;
