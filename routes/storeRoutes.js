const express = require("express");
const router = express.Router();
const { createStore, updateStore, addBook, updateBook, deleteBook, fetchStores, fetchBooks, fetchBookById } = require("../controllers/storeController");

router.get("/stores", fetchStores);
router.get("/books", fetchBooks);
router.get("/books/:bookById", fetchBookById);

router.put("/create-store", createStore);
router.patch("/stores/update-store", updateStore);
router.post("/books/add-book", addBook);
router.patch("/books/update-book", updateBook);
router.delete("/books/remove-book", deleteBook);

module.exports = router;