const { Router } = require("express");
const {
  signupUser,
  loginUser,
  logoutUSer,
} = require("../controllers/authController");

const router = Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUSer);

module.exports = router;
