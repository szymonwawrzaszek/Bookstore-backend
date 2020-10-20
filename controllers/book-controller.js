const { validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');

const Book = require('../models/book');
const Author = require('../models/author');

const fileHelper = require('../helpers/file');

module.exports.getAll = (req, res, next) => {
    const authHeader = req.get('Authorization');
    let auth = false
    if (authHeader.split(' ').length >= 2){
        const token = authHeader.split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, 'secretpasswordhash');
            auth = true
        } catch (err) {
            auth = false
        // err.message = "Invalid token!"
        // err.statusCode = 500;
        // throw err;
        }
        // if (!decodedToken) {
        // console.log("ltl")  
        // const error = new Error('Not authenticated.');
        // error.statusCode = 401;
        // throw error;
        // }

        //req.userId = decodedToken.userId;
    }

    if(auth){
        Book.find().populate("author")
            .then(books => {
                // res.render('./book/show-books', {
                //     books: books,
                //     title: 'All books'
                // })
                res.status(200).json({books: books})
            })
            .catch(err => console.log(err));
    } else {
        Book.find().limit(3)
            .then(books => {
                // res.render('./book/show-books', {
                //     books: books,
                //     title: 'All books'
                // })
                res.status(200).json({books: books})
            })
            .catch(err => console.log(err));
    }


}

module.exports.getBook = async (req, res, next) => {
    const authorId = req.params.authorId;
    const id = req.params.bookId;

    try {
        const author = await Author.findById(authorId)
        if(!author) {
            const error = new Error('Author not found!');
            error.statusCode = 401;
            throw error;
        }
        const book = await  Book.findById(id)
        if(!book) {
            const error = new Error('Book not found!');
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({book: book, author: author})
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
   
}

module.exports.getSearchBooks = async (req, res, next) => {
    const name = req.params.name;

    try {
        const books = await Book.find({title: {  "$regex": name, "$options": "i"  }})
        const booksDescription = await Book.find({description: {  "$regex": name, "$options": "i"  }})
        let difference = booksDescription.filter(x => !books.includes(x));
        res.status(200).json({books: books, booksDescription: difference})
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
   
}

// module.exports.getAdd = (req, res, next) => {
//     const authorId = req.params.authorId;
    
//     Author.findById(authorId)
//         .then(author => {
//             res.render('./book/add-book', {
//                 author: author,
//                 title: 'New book',
//                 oldInput: {
//                     title: "",
//                     pageCount: 0,
//                     description: ""
//                 },
//                 errors: []
//             })
//         })
//         .catch(err => console.log(err));
// }

module.exports.postAdd = async (req, res, next) => {
    const authorId = req.params.authorId;
    const { title, pageCount, description } = req.body;
    const image = req.file;
    let errors = validationResult(req);
    errors = errors.array().map(e => e.msg);
 
    if (!image) {
        errors.push('Attached file is not an image.')
    }
   
     
    try {
        if(errors.length > 0){
            //return res.status(422).json({message: errors[0]})  
            const error = new Error(errors.errors[0]);
            error.statusCode = 422;
            throw error; 
        }
        let bookAuthor;
        let author = await Author.findById(authorId)
        bookAuthor = author;
        let book = await Book.create({
            title: title, 
            pageCount: pageCount, 
            description: description,
            author: author,
            imageUrl: image.path
        })
        bookAuthor.books.push({
            bookId: book.id, 
            title: book.title
        });
        await bookAuthor.save();
        return res.status(201).json({message: "Created"})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err); 
    } 

}

// module.exports.getEdit = (req, res, next) => {
//     const authorId = req.params.authorId;
//     const bookId = req.params.bookId;

//     Author.findById(authorId)
//     .then(author => {
//         Book.findById(bookId)
//         .then(book => 
//             res.render('./book/edit-book', {
//                 book: book,
//                 author: author,
//                 title: 'Edit book',
//                 oldInput: {
//                     title: "",
//                     pageCount: 0,
//                     description: ""
//                 },
//                 errors: []
//         }))
//     })
//     .catch(err => console.log(err));
// }

module.exports.postEdit = async (req, res, next) => {
    const authorId = req.params.authorId;
    const { id, title, pageCount, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);

    try {
        if(errors.errors.length > 0){
            const error = new Error(errors.errors[0].msg);
            error.statusCode = 401;
            throw error;
        }  
        const author = await Author.findById(authorId)
        if(!author){
            const error = new Error('No author in database!');
            error.statusCode = 401;
            throw error;
          }
        if(image && Object.keys(image).length > 0){
            let book = await Book.findById(id)
            fileHelper.deleteFile(book.imageUrl)
            await Book.findByIdAndUpdate(id, {title: title, pageCount: pageCount, description: description, imageUrl: String(image.path.toString())})
            res.status(204).json({message: "Updated succesfully with picture change"})  
        }    
        else {
            await Book.findByIdAndUpdate(id, {title: title, pageCount: pageCount, description: description})
            res.status(200).json({message: "Updated succesfully"})     
        }
        
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

module.exports.postDelete = (req, res, next) => {
    const authorId = req.params.authorId;
    const bookId = req.body.id;
    let bookAuthor;

    Author.findById(authorId)
        .then(author => {
            bookAuthor = author;
            let index = bookAuthor.books.findIndex(e => e.bookId == bookId)
            bookAuthor.books.splice(index, 1);

            Book.findById(bookId)
                .then((book) => {
                    book.remove();
                    bookAuthor.save()
                })
                .then(() => res.redirect('/books'))                
        })
        .catch(err => console.log(err));
}