const passport = require("passport");
const mongoose = require("mongoose");
const { findOneAndUpdate } = require("../models/storeModel");
const storeModel = require("../models/storeModel");
const userModel = require("../models/userModel");

// note: user can perform CURD operation only in current user store.

const createStore = async (req, res) => {
    const { storeName, ownerName } = req.body;
    console.log("\nCreate store request details: ", storeName, ownerName);

    // check user is authenticated or not this function is provided by passport
    if (req.isAuthenticated()) {
        try {
            // req.user property is same as current user id and it is provided by passport
            const currentUser = req.user

            // check req body data is defined or not
            if (!storeName || !ownerName) {
                const message = `storeName and ownerName must be defined to create store`;
                console.log(message);
                return res.status(406).json({ message });
            }

            // check if user has exsisting store
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (findStore) {
                const message = "Store already available";
                console.log(message);
                return res.status(409).json({ message });
            }

            // create new store
            const newStore = await new storeModel({
                // store _id and user _id is kept same to identify that store belongs to particular user 
                _id: currentUser._id,
                storeName,
                ownerName
            });

            // save store 
            const saveStore = await newStore.save();
            const message = `Store created successfull`;
            console.log(message);
            res.status(200).json({ saveStore, message });
        } catch (err) {
            console.log("Create store error: ", err.message);
            res.status(500).json({ message: err.message });
        }
    } else {
        const message = "Unauthorized access";
        console.log(message);
        return res.status(401).json({ message });
    }
}

const updateStore = async (req, res) => {
    const { storeName, ownerName } = req.body;
    console.log("\nUpdate store request with details:", storeName, ownerName);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            if (!storeName || !ownerName) {
                const message = "storeName and ownerName must be defined";
                console.log(message);
                return res.status(409).json({ message });
            }

            // check if user has created store or not
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (!findStore) {
                const message = "You have no store, create store first";
                console.log(message);
                return res.status(406).json({ message });
            }

            // update store details
            const updateStoreStatus = await storeModel.updateOne({
                _id: currentUser._id
            }, {
                $set: {
                    storeName: storeName,
                    ownerName: ownerName
                }
            });
            if (updateStoreStatus.modifiedCount === 1) {
                const message = "user store update successfull";
                console.log(message);
                return res.status(200).json({ updateStoreStatus, message });
            }
            const message = "Something went wrong or trying to update with existing store details";
            console.log(message);
            res.status(406).json({ updateStoreStatus, message });


        } catch (err) {
            console.log("Update store of user error:", err.message);
            res.status(500).json({ message: err.message });
        }

    } else {
        const message = "Unauthorized access";
        console.log(message);
        res.status(401).json({ message });
    }

}

const addBook = async (req, res) => {
    const { bookName, totalStock } = req.body;
    console.log("\nAdd book request with details:", bookName, totalStock);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            // check req body data is defined or not
            if (!bookName || !totalStock) {
                const message = "bookName and totalStock must be defined to add book";
                console.log(message);
                return res.status(406).json({ message });
            }

            // check if user has store if not then don't allow to store book
            const findStore = await storeModel.findOne({
                _id: currentUser._id
            }, '_id');
            if (!findStore) {
                const message = "Create your store first to add book";
                console.log(message);
                return res.status(406).json({ message });
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

            // mongoose method to add book to current user store
            const saveBook = await storeModel.findOneAndUpdate({
                _id: currentUser._id
            }, {
                $push: {
                    books: newBookInventory
                }
            }, { new: true });
            const message = "Book added successfull";
            console.log(message);
            res.status(200).json({ saveBook, message });
        } catch (err) {
            console.log("Add book to user store error:", err.message);
            res.status(500).json({ message: err.message });
        }
    } else {
        const message = "Unauthorized access";
        console.log(message);
        return res.status(401).json({ message });
    }
}

const updateBook = async (req, res) => {

    const { bookId, bookName, totalStock } = req.body;
    console.log("\nUpdate book request with details:", bookId, bookName, totalStock);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            // if req body is not defined
            if (!bookId || !bookName || !totalStock) {
                const message = "bookId bookName totalStock must be defined to update the book";
                console.log(message);
                return res.status(406).json({ message });
            }

            // check bookId is valid or not
            const isBookIdValid = mongoose.Types.ObjectId.isValid(bookId);
            if (!isBookIdValid) {
                const message = "Invalid book id";
                console.log(message);
                return res.status(406).json({ message });
            }

            // check if user has created store or not
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (!findStore) {
                const message = "You have no store,create store first";
                console.log(message);
                return res.status(406).json({ message });
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
            const message = "Something went wrong,check book id or trying to update the book with existing details";
            console.log(message);
            return res.status(406).json({ updateBook, message });

        } catch (err) {
            console.log("Update book in user store error:", err.message);
            res.status(500).json({ message: err.message });
        }

    } else {
        const message = "Unauthorized access";
        console.log(message);
        res.status(401).json({ message });
    }
}

const deleteBook = async (req, res) => {
    const { bookId } = req.body;
    console.log("\nDelete book by id request with details:", bookId);

    if (req.isAuthenticated()) {
        try {
            const currentUser = req.user;

            // if req body is not defined
            if (!bookId) {
                const message = "bookId is not defined";
                console.log(message);
                return res.status(406).json({ message });
            }

            // check book id is valid or not
            const isBookIdValid = mongoose.Types.ObjectId.isValid(bookId);
            if (!isBookIdValid) {
                const message = "Invalid book id";
                console.log(message);
                return res.status(406).json({ message });
            }

            // check if user has created store or not
            const findStore = await storeModel.findOne({ _id: currentUser._id }, '_id')
            if (!findStore) {
                const message = "You have no store,create store first";
                console.log(message);
                return res.status(406).json({ message });
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
            const message = "Something went wrong,check book id";
            console.log(message);
            res.status(406).json({ deleteBookStatus, message });
        } catch (err) {
            console.log("Delete book error:", err.message);
            res.status(500).json({ message: err.message });
        }
    } else {
        const message = "Unauthorized access";
        console.log(message);
        return res.status(401).json({ message });
    }
}

const fetchStores = async (req, res) => {
    try {
        const findStore = await storeModel.find({});
        console.log("\nFetch all stores successfull");
        res.status(200).json(findStore);

    } catch (err) {
        console.log("\nFetch store error:", err.message);
        res.status(500).json({ message: err.message });
    }
}

const fetchBooks = (req, res) => {
    console.log("\nFetch all books");

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
                const message = "404 not found";
                console.log(message);
                return res.status(404).json({ message });
            }
            console.log("Fetch books successfull");
            return res.status(200).json(docs);
        }
        console.log("Fetch book error:", err.message);
        res.status(200).json({ message: err.message });
    });
}

const fetchBookById = (req, res) => {
    const bookId = req.params.bookById;
    console.log("\nFetch book by Id:", bookId);

    // check if book id is defined or not
    if (!bookId) {
        const message = "Book id must be defined in params";
        console.log(`\n${message}`);
        return res.status(409).json({ message });
    }

    // check book id is valid or not
    const isBookIdValid = mongoose.Types.ObjectId.isValid(bookId);
    if (!isBookIdValid) {
        const message = "Invalid book id";
        console.log(message);
        return res.status(406).json({ message });
    }

    // fetch books by from all stores 
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
                const message = "404 not found";
                console.log(message);
                return res.status(404).json({ message });
            }
            console.log("Fetch book by id successfull");
            return res.status(200).json(docs);
        }
        console.log("Fetch book by id error:", err.message);
        return res.status(500).json({ message: err.message });
    });
}

module.exports = {
    createStore, updateStore, addBook, updateBook, deleteBook, fetchStores, fetchBooks, fetchBookById
}