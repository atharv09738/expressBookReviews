const express = require('express');
const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];


// Check if username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};


// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};


// Login registered user
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (authenticatedUser(username, password)) {

        const accessToken = jwt.sign(
            { username: username },
            "fingerprint_customer",
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "User successfully logged in",
            accessToken: accessToken
        });
    }

    return res.status(401).json({
        message: "Invalid username or password"
    });
});


// Add a book review
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.body.review;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Check if review was provided
    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    // Get username from JWT token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "fingerprint_customer");
        const username = decoded.username;

        // Add/update review for this user
        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added successfully",
            reviews: books[isbn].reviews
        });

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Get authentication token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "fingerprint_customer");
        const username = decoded.username;

        // Check if this user has a review
        if (!books[isbn].reviews[username]) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        // Delete the user's review
        delete books[isbn].reviews[username];

        return res.status(200).json({
      message: `Review for ISBN ${isbn} deleted.`,
      reviews: books[isbn].reviews
      });

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;