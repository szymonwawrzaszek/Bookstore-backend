const express = require('express');
const { check, body } = require('express-validator/check');

const bookController = require('../controllers/book-controller');
const isAuth = require('../middleware/is_auth')

const router = express.Router();

router.get('/books', bookController.getAll);
router.get('/books-search/:name', isAuth, bookController.getSearchBooks);
//router.get('/author/:authorId/book-add', isAuth, bookController.getAdd);
router.post('/author/:authorId/book-add', isAuth, [
    check('title').trim()
        .notEmpty().withMessage('Title cannot be empty!')
        .isLength({min: 3, max: 50}).withMessage('Title must be between 3 and 50 characters!'),
    check('pageCount')
        .isInt({min: 1, max: 10000}).withMessage('Page count must be between 1 and 10 000 pages!'),
    check('description')
        .isLength({min: 10, max: 1000}).withMessage('Description must be between 10 and 1000 characters!'),
], bookController.postAdd);

router.post('/author/:authorId/book-edit', isAuth, [
    check('title').trim()
        .notEmpty().withMessage('Title cannot be empty!')
        .isLength({min: 3, max: 50}).withMessage('Title must be between 3 and 50 characters!'),
    check('pageCount')
        .isInt({min: 1, max: 10000}).withMessage('Page count must be between 1 and 10 000 pages!'),
    check('description')
        .isLength({min: 10, max: 1000}).withMessage('Description must be between 10 and 1000 characters!'),
], bookController.postEdit);

router.post('/author/:authorId/book-delete', isAuth, bookController.postDelete);
//router.get('/author/:authorId/book-edit/:bookId', isAuth, bookController.getEdit);
router.get('/author/:authorId/book/:bookId', /*isAuth,*/ bookController.getBook);

module.exports = router;