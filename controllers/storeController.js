const passport = require("passport");
const mongoose = require("mongoose");
const { findOneAndUpdate } = require("../models/storeModel");
const storeModel = require("../models/storeModel");
const userModel = require("../models/userModel");

// Authentication error
const error = new Error("Unauthorized access");
error.status = 401;


// note: user can perform CURD operation to store/book_inventory that belongs to user.

const createStore = async (req, res, next) => {
    const { storeName, ownerName } = req.body;
    console.log("\nCreate store request with details: ", storeName, ownerName);

    // if user is authenticated, this function is provided by passport
    if (req.isAuthenticated()) {
        try {
            // req.user property is same as current user id and it is provided by passport
            const currentUser = req.user

            // if req body data is undefined
            if (!storeName || !ownerName) {
                const err = new Error(`storeName or ownerName field missing`);
                err.status = 422;
                return next(err);
            }

            // if user has exsisting store
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (findStore) {
                const err = new Error("Store already exist");
                err.status = 409;
                return next(err);
            }

            // create new store, store and user _id is kept same to identify that store belongs to that particular user
            const newStore = await new storeModel({
                _id: currentUser._id,
                storeName,
                ownerName
            });

            // save store 
            const saveStore = await newStore.save();
            const message = `Store created successfull`;
            console.log(message);
            return res.status(200).json({ saveStore, message });
        } catch (err) {
            return next(err);
        }
    }
    next(error);
}

const updateStore = async (req, res, next) => {
    const { storeName, ownerName } = req.body;
    console.log("\nUpdate store request with details:", storeName, ownerName);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            if (!storeName || !ownerName) {
                const err = new Error("storeName or ownerName field missing");
                err.status = 422;
                return next(err)
            }

            // if user doesn't have existing store
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (!findStore) {
                const err = new Error("Store doesn't exist");
                err.status = 422;
                return next(err);
            }

            // update store 
            const updateStoreStatus = await storeModel.updateOne({
                _id: currentUser._id
            }, {
                $set: {
                    storeName: storeName,
                    ownerName: ownerName
                }
            });
            const message = "Store update successfull";
            console.log(message);
            return res.status(200).json({ updateStoreStatus, message });
        } catch (err) {
            return next(err);
        }
    }
    next(error);
}

const addBook = async (req, res, next) => {
    const { bookName, totalStock } = req.body;
    console.log("\nAdd book request with details:", bookName, totalStock);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            // if req body data is undefined
            if (!bookName || !totalStock) {
                const err = new Error("bookName or totalStock field missing");
                err.status = 422;
                return next(err);
            }

            // if user doesn't have existing store
            const findStore = await storeModel.findOne({
                _id: currentUser._id
            }, '_id');
            if (!findStore) {
                const err = new Error("Store doesn't exist");
                err.status = 422;
                return next(err);
            }

            // set the stock status
            let stockStatus;
            if (totalStock >= 1) {
                stockStatus = true;
            } else {
                stockStatus = false;
            }

            const newBookInventory = {
                name: bookName,
                totalStock,
                stockStatus
            }

            // add book to current user store
            const saveBook = await storeModel.findOneAndUpdate({
                _id: currentUser._id
            }, {
                $push: {
                    books: newBookInventory
                }
            }, { new: true });
            const message = "Book added successfull";
            console.log(message);
            return res.status(200).json({ saveBook, message });
        } catch (err) {
            return next(err);
        }
    }
    next(error);
}

const updateBook = async (req, res, next) => {

    const { bookId, bookName, totalStock } = req.body;
    console.log("\nUpdate book request with details:", bookId, bookName, totalStock);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            // if req body is undefined
            if (!bookId || !bookName || !totalStock) {
                const err = new Error("bookId or bookName or totalStock field missing");
                err.status = 422;
                return next(err);
            }

            // if bookId is invalid
            const isBookIdValid = mongoose.Types.ObjectId.isValid(bookId);
            if (!isBookIdValid) {
                const err = new Error("Invalid book id");
                err.status = 400;
                return next(err);
            }

            // if user doesn't have existing store
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (!findStore) {
                const err = new Error("Store doesn't exist");
                err.status = 422;
                return next(err);
            }

            // set stock status
            let stockStatus;
            if (totalStock >= 1) {
                stockStatus = true;
            } else {
                stockStatus = false;
            }

            // update book
            const updateBook = await storeModel.updateOne({
                _id: currentUser._id
            }, {
                $set: {
                    "books.$[books].name": bookName,
                    "books.$[books].totalStock": totalStock,
                    "books.$[books].stockStatus": stockStatus
                }
            }, {
                arrayFilters: [{ 'books._id': bookId }]
            });
            console.log(updateBook);
            if (updateBook.modifiedCount === 1) {
                const message = "Book update successfull";
                console.log(message);
                return res.status(200).json({ updateBook, message });
            }
            const err = new Error("Book doesn't exist in store, or trying to update with existing book details");
            err.status = 422;
            return next(err);
        } catch (err) {
            return next(err);
        }
    } else {
        next(error);
    }
}

const deleteBook = async (req, res, next) => {
    const { bookId } = req.body;
    console.log("\nDelete book by id request with details:", bookId);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            // if req body is undefined
            if (!bookId) {
                const err = new Error("bookId field missing");
                err.status = 422;
                return next(err);
            }

            // if book id is invalid
            const isBookIdValid = mongoose.Types.ObjectId.isValid(bookId);
            if (!isBookIdValid) {
                const err = new Error("Invalid book id");
                err.status = 400;
                return next(err);
            }

            // if user doesn't have existing store
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (!findStore) {
                const err = new Error("Store doesn't exist");
                err.status = 422;
                return next(err);
            }

            // delete book 
            const deleteBookStatus = await storeModel.updateOne({
                _id: currentUser._id
            }, {
                $pull: {
                    books: {
                        _id: bookId
                    }
                }
            });
            if (deleteBookStatus.modifiedCount === 1) {
                const message = "Book delete successfull";
                console.log(message);
                return res.status(200).json({ deleteBookStatus, message });
            }
            const err = new Error("Book doesn't exist in store, check Book Id");
            err.status = 404;
            return next(err);
        } catch (err) {
            return next(err);
        }
    }
    next(error);
}

const fetchStores = async (req, res, next) => {
    console.log('\nFetch all stores request');
    try {
        const findStore = await storeModel.find({});
        if (findStore.length === 0) {
            const err = new Error("Stores Not Found");
            err.status = 404;
            return next(err);
        }
        console.log("\nFetch all stores successfull");
        res.status(200).json(findStore);
    } catch (err) {
        next(err);
    }
}

const fetchBooks = (req, res, next) => {
    console.log("\nFetch all books request");

    // aggreagete method to find all the books
    storeModel.aggregate([
        {
            "$group": {
                "_id": "null",
                "books": {
                    "$addToSet": "$books"
                }
            }
        },
        {
            "$project": {
                _id: 0
            }
        }
    ]).exec((err, docs) => {
        if (!err) {
            if (docs.length === 0) {
                const err = new Book("Books Not Found");
                err.status = 404;
                return next(err);
            }
            console.log("Fetch books successfull");
            return res.status(200).json(docs);
        }
        next(err);
    });
}

const fetchBookById = (req, res, next) => {
    const bookId = req.params.bookById;
    console.log("\nFetch book by Id:", bookId);

    // if book id is undefined
    if (!bookId) {
        const err = new Error("Book id params missing");
        err.status = 422;
        return next(err);
    }

    // if book id is invalid
    const isBookIdValid = mongoose.Types.ObjectId.isValid(bookId);
    if (!isBookIdValid) {
        const err = new Error("Invalid Book Id");
        err.status = 400;
        return next(err);
    }

    // fetch books by id from all stores 
    storeModel.aggregate([
        {
            "$match": {
                "books._id": mongoose.Types.ObjectId(`${bookId}`)
            }
        },
        {
            "$unwind": "$books"
        },
        {
            "$match": {
                "books._id": mongoose.Types.ObjectId(`${bookId}`)
            }
        },
        {
            "$project": {
                _id: 0,
                books: 1
            }
        }
    ]).exec((err, docs) => {
        if (!err) {
            if (docs.length === 0) {
                const err = new Error("Book Not Found");
                err.status = 404;
                return next(err);
            }
            console.log("Fetch book by id successfull");
            return res.status(200).json(docs);
        }
        next(err);
    });
}

module.exports = {
    createStore, updateStore, addBook, updateBook, deleteBook, fetchStores, fetchBooks, fetchBookById
}