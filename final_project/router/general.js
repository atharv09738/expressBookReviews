const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const API_BASE_URL = "http://localhost:5000";


// ===============================
// Register a new user
// ===============================
public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {

        if (isValid(username)) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        users.push({
            username: username,
            password: password
        });

        return res.status(200).json({
            message: "User successfully registered"
        });
    }

    return res.status(400).json({
        message: "Username and password are required"
    });
});


// =====================================================
// Internal API endpoint used by Axios
// =====================================================
public_users.get('/api/books-data', (req, res) => {
    return res.status(200).json(books);
});


// =====================================================
// Get all books using Axios + async/await
// =====================================================
async function getAllBooks() {

    try {

        const response = await axios.get(
            `${API_BASE_URL}/api/books-data`
        );

        return response.data;

    } catch (error) {

        throw new Error("Unable to retrieve books");
    }
}


// =====================================================
// Get book by ISBN using Axios + async/await
// =====================================================
async function getBookByISBN(isbn) {

    const allBooks = await getAllBooks();

    if (allBooks[isbn]) {
        return allBooks[isbn];
    }

    return null;
}


// =====================================================
// Get books by Author using Axios + async/await
// =====================================================
async function getBooksByAuthor(author) {

    const allBooks = await getAllBooks();

    const result = Object.values(allBooks).filter(
        book =>
            book.author.toLowerCase() === author.toLowerCase()
    );

    return result;
}


// =====================================================
// Get books by Title using Axios + async/await
// =====================================================
async function getBooksByTitle(title) {

    const allBooks = await getAllBooks();

    const result = Object.values(allBooks).filter(
        book =>
            book.title.toLowerCase() === title.toLowerCase()
    );

    return result;
}


// =====================================================
// Public route: Get all books
// =====================================================
public_users.get('/', async function (req, res) {

    try {

        const allBooks = await getAllBooks();

        return res.status(200).json(allBooks);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
});


// =====================================================
// Public route: Get book by ISBN
// =====================================================
public_users.get('/isbn/:isbn', async function (req, res) {

    try {

        const isbn = req.params.isbn;

        const book = await getBookByISBN(isbn);

        if (book) {
            return res.status(200).json(book);
        }

        return res.status(404).json({
            message: "Book not found"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
});


// =====================================================
// Public route: Get books by Author
// =====================================================
public_users.get('/author/:author', async function (req, res) {

    try {

        const author = req.params.author;

        const result = await getBooksByAuthor(author);

        if (result.length > 0) {
            return res.status(200).json(result);
        }

        return res.status(404).json({
            message: "No books found for this author"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
});


// =====================================================
// Public route: Get books by Title
// =====================================================
public_users.get('/title/:title', async function (req, res) {

    try {

        const title = req.params.title;

        const result = await getBooksByTitle(title);

        if (result.length > 0) {
            return res.status(200).json(result);
        }

        return res.status(404).json({
            message: "No books found with this title"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
});


// =====================================================
// Get book reviews
// =====================================================
public_users.get('/review/:isbn', async function (req, res) {

    try {

        const isbn = req.params.isbn;

        const book = await getBookByISBN(isbn);

        if (book) {
            return res.status(200).json(book.reviews);
        }

        return res.status(404).json({
            message: "Book not found"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });
    }
});


module.exports.general = public_users;