const passport = require("passport");
const userModel = require("../models/userModel");
const storeModel = require("../models/storeModel");
const bcrypt = require("bcrypt");
const saltRound = 6;

// note: mongodb create _id property to each collection by defualt

const getUser = (req, res, next) => {
    console.log("\nFetch user profile");

    if (req.isAuthenticated()) {
        console.log("User profile fetch successfull");
        return res.status(200).json(req.user);
    }
    const err = new Error("Login to access your profile");
    err.status = 401;
    next(err);
}

const login = (req, res, next) => {
    const { email, password } = req.body;
    console.log("\nLogin request with details: ", email, password);

    // whenever we call this passport authencticate function, passport internally call function that we defined in config passport file
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            const err = new Error(info.message);
            err.status = 401;
            next(err);
        }

        req.login(user, err => {
            if (err) return next(err);
            res.status(200).json({ user, message: "Login successfull" });
        });
    })(req, res, next);
}

const logout = (req, res, next) => {
    req.logout();
    const message = "Logout successfull";
    console.log(`\n${message}`);
    res.status(200).json({ message });
}

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log("\nRegister request with details:", email, password);

        // if req body data is undefined
        if (!email || !password) {
            const err = new Error("email and password field missing");
            err.status = 422;
            return next(err);
        }

        // check if email exist or not 
        const checkEmail = await userModel.findOne({ email: email }, '-_id,email');
        if (checkEmail) {
            const err = new Error("Email already exist try different Email");
            err.status = 409;
            return next(err);
        }

        // hash the user password for better security
        const hashPassword = bcrypt.hashSync(password, saltRound);

        // save the new user
        const newUser = await new userModel({ email, password: hashPassword });
        const registerUser = await newUser.save();

        const message = "Register successfull";
        console.log(message);
        res.status(200).json({ registerUser, message });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login, register, getUser, logout
}