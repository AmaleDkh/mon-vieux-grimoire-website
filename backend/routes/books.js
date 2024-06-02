const express = require("express");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const router = express.Router();

const booksCtrl = require("../controllers/books");

// Get books
router.get("/", booksCtrl.getAllBooks);

// Get the 3 books with the best ratings
router.get("/bestrating", booksCtrl.getBooksBestRatings);

// Get a book
router.get("/:id", booksCtrl.getOneBook);

// Post a new book
router.post("/", auth, multer, booksCtrl.createBook);

// Post a new book rating
router.post("/:id/rating", auth, booksCtrl.createNewBookRating);

// Modify a book
router.put("/:id", auth, multer, booksCtrl.modifyBook);

// Delete a book
router.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
