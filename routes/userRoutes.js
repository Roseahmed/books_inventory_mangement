const express = require("express");
const router = express.Router();
const { login, register, getUser, logout } = require("../controllers/userController");

router.get("/me", getUser);
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);

module.exports = router;