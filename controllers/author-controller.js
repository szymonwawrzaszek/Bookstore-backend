const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator/check');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Author = require('../models/author');
const Book = require('../models/book');
const Publisher = require('../models/publisher');
const Authentication = require('../models/user');

module.exports.getAll = async (req, res, next) => {
    try {
        const authors = await Author.find()
        //console.log(authors)
        // res.render('./author/show-authors', {
        //     authors: authors,
        //     title: 'All authors'
        // })
        res.status(200).json({authors: authors})
    } catch (err) {
        const error = new Error(err);
        error.message = 'Cannot find data in DB!'
        error.httpStatusCode = 500;
        return next(error);
    }
}

module.exports.getAuthor = async (req, res, next) => {
    const id = req.params.authorId;

    try {
        const author = await Author.findById(id)
        const availablePublishers = await Publisher.find({ 
            _id: { $nin: author.publishers.map(x => x._id) }
        });
        //console.log(availablePublishers)
        // res.render('./author/author-details', {
        //     author: author,
        //     title: `${author.firstName} ${author.lastName}`
        // })
        res.status(200).json({author: author, availablePublishers: availablePublishers })
    } catch (err) {
        const error = new Error(err);
        error.message = 'Cannot find data in DB!'
        error.httpStatusCode = 500;
        return next(error);
    }
}

// module.exports.getAdd = (req, res, next) => {
//     res.render('./author/add-author', {
//         title: 'New author'
//     })
// }
 
module.exports.postAdd = async (req, res, next) => {
    const { firstName, lastName } = req.body;
    const errors = validationResult(req);

    try {
        if(!errors.isEmpty()){
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 401;
            throw error;
        }
        let pub = await Publisher.findOne({user: req.userId})
        let aut = await Author.findOne({user: req.userId})
        if(pub || aut){
            const error = new Error("User can only have one author or publisher");
            error.statusCode = 401;
            throw error; 
        }
        let author = await Author.create({firstName: firstName, lastName: lastName, user: req.userId })
        let user = await Authentication.findByIdAndUpdate(req.userId, {status: "author"})
        res.status(201).json({author: author})
        //res.redirect('/authors')
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        // const error = new Error(err);
        // error.message = 'Cannot find data in DB!';
        // error.httpStatusCode = 500;
        // return next(error);
    }
}

module.exports.postEdit = async (req, res, next) => {
    const { firstName, lastName, authorId } = req.body;
    const errors = validationResult(req);

    try {
        if(!errors.isEmpty()){
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 401;
            throw error;
        }
        let author = await Author.findByIdAndUpdate(authorId, {firstName: firstName, lastName: lastName});
        res.status(201).json({author: author})
        //res.redirect('/authors')
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        // const error = new Error(err);
        // error.message = 'Cannot find data in DB!';
        // error.httpStatusCode = 500;
        // return next(error);
    }
}

module.exports.getDownloadBooks = async(req, res, next) => {
    const id = req.params.authorId;
   
    try {
        const author = await Author.findById(id).populate('books.bookId') 
        let filename = 'generated-pdf.pdf'
        let filePath = path.join('data', 'pdf', filename);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));
        doc.pipe(res);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="' + filename + '"'  //inline
            );

        doc.text(`${ author.firstName } ${ author.lastName } books:`, {
            align: 'center'
        });
        author.books.forEach(e => {
            doc.text(`- ${e.title}`);
        });   
        doc.end();     
    } catch (err) {
        errorHandler(err, next);
    }      
}

module.exports.deleteAuthor = async(req, res, next) => {
    const id = req.params.authorId;

    try {
        const author = await Author.findById(id)   
        await author.remove()
        //res.redirect('/authors')
        res.status(204).json({message: "Author deleted"})
    } catch (err) {
        errorHandler(err, next);
    }
}

module.exports.addAuthorToPublisher = async (req, res, next) => {
    const publisherId = req.body.publisherId;
    const authorId = req.params.authorId;   
    const publisher = await Publisher.findById(publisherId);
    const author = await Author.findById(authorId);
    
    if(author && publisher){
        publisher.authors.push({author: author._id, status: 'Not accepted'});
        await publisher.save();
        author.publishers.push(publisher);
        await author.save();
        //return res.redirect(`/publisher/${publisher.id}`)
        return res.status(201).json({message: "Author assaigned to publisher"})
    }
    //res.redirect('/publishers');    
    const error = new Error("Something went wrong!");
    error.statusCode = 401;
    next(error)
}

function errorHandler(err, next) {
    const error = new Error(err);
    error.message = 'Cannot find data in DB!';
    error.httpStatusCode = 500;
    return next(error);
}
