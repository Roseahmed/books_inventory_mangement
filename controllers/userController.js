const passport = require("passport");
const userModel = require("../models/userModel");
const storeModel = require("../models/storeModel");
const bcrypt = require("bcrypt");
const saltRound = 6;

// note: mongodb create _id property to each collection by defualt

const getUser = (req, res) => {
    console.log("\nFetch user request");
    if (req.isAuthenticated()) {
        console.log("User data fetch successfull");
        res.status(200).json(req.user);
    } else {
        const message = "Unauthorised access";
        console.log(message);
        res.status(401).json({ message });
    }
}

const login = (req, res, next) => {
    const { email, password } = req.body;
    console.log("\nLogin data for user: ", email, password);

    // whenever we call this passport authencticate function passport internally call function that we defined in config passport file
    passport.authenticate("local", (err, user, info) => {
        if (err) return err;
        if (!user) return res.status(401).json({ message: info.message });

        req.login(user, err => {
            if (err) return err;
            res.status(200).json({ user, message: "Login successfull" });
        })
    })(req, res, next);
}

const logout = (req, res) => {
    req.logout();
    const message = "Logout successfull";
    console.log(`\n${message}`);
    res.status(200).json({ message });
}

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("\nRegister data by user:", email, password);

        //if req body data is provided
        if (!email || !password) throw new Error("Req body data email and password can't be empty");

        // check if email is already present or not
        const checkEmail = await userModel.findOne({ email: email }, '-_id,email');
        if (checkEmail) throw new Error("Email already present try different email");

        // hasing the user password for better security
        const hashPassword = bcrypt.hashSync(password, saltRound);

        // saving the new user
        const newUser = await new userModel({ email, password: hashPassword });
        const registerUser = await newUser.save();

        const message = "Register successfull";
        console.log(message);
        res.status(200).json({ registerUser, message });
    } catch (err) {
        console.log("Register error:", err.message);
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    login, register, getUser, logout
}