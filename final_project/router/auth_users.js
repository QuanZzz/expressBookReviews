const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let usersWithSameName = users.filter((u) => {
    return u.username === username;
  });

  if(usersWithSameName.length > 0) {
      return false;
  }else {
      return true;
  }
}

const authenticatedUser = (username,password)=>{
  const validUsers = users.filter((u) => {
    return u.username === username && u.password === password;
  })

  if(validUsers.length > 0) {
      return true;
  }else {
      return false;
  }
}

const deleteReviewIfExists = (username, reviews) => {
  for (const key in reviews) {
      if (reviews[key].username === username) {
          delete reviews[key];
      }
  }
  return reviews; // Review not found
}

const addOrUpdateReview = (username, newReview, reviews) => {
  const updatedReviews = { ...reviews }; 

    let userFound = false;
    for (const key in updatedReviews) {
        if (updatedReviews[key].username === username) {
            updatedReviews[key].review = newReview;
            userFound = true;
            break;
        }
    }

    if (!userFound) {
        const newKey = Object.keys(updatedReviews).length + 1;
        updatedReviews[newKey] = { username, review: newReview };
    }

  return updatedReviews;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password) {
    return res.status(404).json({
        message: "Error logging in"
    });
  }

  if(authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
        data: password
    }, 'access', {expiresIn: 60 * 60});

    req.session.authorization = {
        accessToken, username
    }

    return res.status(200).send("User successfully logged in");
  }else {
    return res.status(208).json({
        message: "Invalid Login. Check username and password"
    });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const book = books[isbn];
  let updatedReviews = {};

  if(book) {
    const newReview = req.query.review;
    const reviews = books[isbn].reviews;
    updatedReviews = addOrUpdateReview(username, newReview, reviews);
    books[isbn].reviews = updatedReviews;
    return res.status(200).json({message: "Posted review successfully"});
  }else {
    res.send("Unable to find the book")
  }
  // const isbn = req.params.isbn;
  // let filtered_book = books[isbn]
  // if (filtered_book) {
  //     let review = req.query.review;
  //     let reviewer = req.session.authorization['username'];
  //     if(review) {
  //         filtered_book['reviews'][reviewer] = review;
  //         books[isbn] = filtered_book;
  //     }
  //     res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
  // }
  // else{
  //     res.send("Unable to find this ISBN!");
  // }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  books[isbn].reviews = deleteReviewIfExists(username, books[isbn].reviews);
  return res.status(200).json({message: "Deleted review successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
