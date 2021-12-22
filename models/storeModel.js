const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    storeName: { type: String },
    ownerName: { type: String },
    books: [{
        name: { type: String },
        totalStock: { type: Number },
        stockStatus: { type: Boolean }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("store", bookSchema);