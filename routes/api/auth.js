const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/verify/:verificationToken", authController.verifyEmail);

router.post("/verify", authController.resendEmail);

module.exports = router;
