const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password) {
    if(isValid(username)) {
      users.push({
        "username": username,
        "password": password
      });
      return res.status(200).json({
          message: "User successfully registered. Now you can login"
      });
    }else {
      return res.status(404).json({
          message: "User already exists"
      });
    }
  }

  return res.status(404).json({
      message: "Unable to register user."
  });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

public_users.get('/books',function (req, res) {
  const get_books = new Promise((resolve, reject) => {
      resolve(res.send(JSON.stringify({books}, null, 4)));
    });
  get_books.then(() => console.log("Promise for Task 10 resolved"));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
 });

public_users.get('/books/isbn/:isbn', function(req, res) {
  const getBookByIsbn = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;

    if(req.params.isbn <= 10) {
      resolve(res.send(books[isbn]));
    }else {
      reject(res.send("ISBN not found"));
    }
  });

  getBookByIsbn.then(function() {
    console.log("Promise for Task 11 is resolved");
  }).catch(function() {
    console.log("ISBN not found");
  });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  for (const key in books) {
      if (books[key].author === author) {
          matchingBooks.push({[key]: books[key]});
      }
  }

  if(matchingBooks.length === 0) {
      return res.send("Book not found for this author.");
  }

  return res.send(matchingBooks);
});

public_users.get('/books/author/:author', function(req, res) {
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const author = req.params.author;
    const matchingBooks = [];

    for (const key in books) {
      if (books[key].author === author) {
          matchingBooks.push({[key]: books[key]});
      }
    }

    if(matchingBooks.length > 0) {
      resolve(res.send(JSON.stringify({matchingBooks}, null, 4)));
    }else {
      reject(res.send("Book not found for this author"));
    }
  });

  getBooksByAuthor.then(function() {
    console.log("Promise is resolved");
  }).catch(function() {
    console.log("No author found");
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (const key in books) {
      if (books[key].title === title) {
          matchingBooks.push({[key]: books[key]});
      }
  }

  if(matchingBooks.length === 0) {
      return res.send("Book not found for this title.");
  }

  return res.send(matchingBooks);
});

public_users.get('/books/title/:title', function(req, res) {
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const title = req.params.title;
    const matchingBooks = [];

    for (const key in books) {
      if (books[key].title === title) {
          matchingBooks.push({[key]: books[key]});
      }
    }

    if(matchingBooks.length > 0) {
      resolve(res.send(JSON.stringify({matchingBooks}, null, 4)));
    }else {
      reject(res.send("Book not found for this title"));
    }
  });

  getBooksByAuthor.then(function() {
    console.log("Promise is resolved");
  }).catch(function() {
    console.log("No title found");
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
