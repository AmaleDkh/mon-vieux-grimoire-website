const Book = require("../models/Book");
const fs = require("fs");

// Get books
// GET /api/books
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Get a book
// GET /api/books/:id
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Get the 3 books with the best ratings
// GET /api/books/bestrating
exports.getBooksBestRatings = (req, res, next) => {
  Book.find()
    .then((books) => {
      const sortedBooks = books.sort(
        (a, b) => b.averageRating - a.averageRating
      );
      const bestRatingsBooks = sortedBooks.slice(0, 3);
      res.status(200).json(bestRatingsBooks);
    })
    .catch((error) => res.status(400).json({ error }));
};

// Post a new book
// POST /api/books
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Book saved" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Post a new book rating
// POST /api/books/:id/rating
exports.createNewBookRating = (req, res, next) => {
  const id = req.params.id;
  const newRating = {
    userId: req.body.userId,
    grade: req.body.rating,
  };

  if (!("userId" in newRating) || !("grade" in newRating)) {
    return res.status(400).json("userId or grade is missing");
  }

  if (newRating.grade < 0 || newRating.grade > 5) {
    return res.status(400).json("Grade should be between 0 and 5");
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        throw new Error("Book not found");
      }

      const bookRatings = book.ratings;

      const currentUserIdRating = bookRatings.find(
        (rating) => rating.userId === newRating.userId
      );

      if (currentUserIdRating) {
        throw new Error("You already rated this book");
      }

      const ratingsLength = bookRatings.length;
      let totalRatings = 0;
      let averageRating = 0;

      for (let i = 0; i < bookRatings.length; i++) {
        totalRatings = totalRatings + bookRatings[i].grade;
      }

      // Calculate the average ratings after adding the new rating
      averageRating = (totalRatings + newRating.grade) / (ratingsLength + 1);

      return Book.findOneAndUpdate(
        { _id: id },
        {
          $push: { ratings: newRating },
          $set: { averageRating: averageRating },
        },
        { returnDocument: "after" }
      );
    })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json(error.message));
};

// Modify a book
// PUT /api/books/:id
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : {
        ...req.body,
      };
  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        throw new Error("Book not found");
      }

      if (book.userId != req.auth.userId) {
        throw new Error("Not authorized");
      }

      return Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      );
    })
    .then(() => res.status(200).json({ message: "Book updated" }))
    .catch((error) => {
      res.status(400).json(error.message);
    });
};

// Delete a book
// DELETE /api/books/:id
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        throw new Error("Book not found");
      }

      if (book.userId != req.auth.userId) {
        throw new Error("Not authorized");
      }

      const filename = book.imageUrl.split("/images/")[1];

      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Book deleted" }))
          .catch((error) => res.status(401).json({ error }));
      });
    })
    .catch((error) => {
      res.status(500).json(error.message);
    });
};
