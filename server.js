require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

const app = express();
const port = 3000;

// config passport local_strategy
require("./config/passport")(passport);

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// connect mongodb
// const mongoUrl = "mongodb://127.0.0.1:27017/bookStoreDB"; // local url
const mongoUrl = process.env.MONGODB_ATLAS;
mongoose.connect(mongoUrl, {
    useNewUrlparser: true,
    useUnifiedTopology: true
}, err => {
    if (err) {
        console.log("Database connection error:", err);
    } else {
        console.log(`Database connected`);
    }
});

// store session data in database for authenticating user
const sessionStore = MongoStore.create({
    mongoUrl: mongoUrl,
    collectionName: "sessions",
    autoRemove: "native",
});

//create session
app.use(
    session({
        name: "auth-cookie",
        secret: "somesecret",// for better security secret should be kept in .env file
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: {
            maxAge: 31536000, // in miliseconds = equal to one day
        }
    })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


////////////////////////////////////Routes///////////////////////////////////////////
app.use(require("./routes/userRoutes"));
app.use(require("./routes/storeRoutes"));

app.get("/", (req, res) => {
    const message = "Welcome to Book Store";
    console.log(`\n${message}`);
    res.status(200).json({ message });
})

app.listen(port, err => {
    if (!err) console.log(`Server started at port:${port}`);
});