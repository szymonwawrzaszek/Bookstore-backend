const express = require('express');
const { check, body } = require('express-validator/check');

const authorController = require('../controllers/author-controller');
const isAuth = require('../middleware/is_auth')

const router = express.Router();

router.get('/authors', isAuth, authorController.getAll);
//router.get('/author/add', isAuth, authorController.getAdd);
router.post('/author/add', isAuth, [
    check('firstName').trim()
        .notEmpty().withMessage('First name cannot be empty!')
        .isLength({min: 3, max: 50}).withMessage('First name must be between 3 and 50 characters!'),
    check('lastName').trim()
        .notEmpty().withMessage('Last name cannot be empty!')
        .isLength({min: 3, max: 50}).withMessage('Last name must be between 3 and 50 characters!'),
], authorController.postAdd);
router.post('/author/edit', isAuth, [
    check('firstName').trim()
        .notEmpty().withMessage('First name cannot be empty!')
        .isLength({min: 3, max: 50}).withMessage('First name must be between 3 and 50 characters!'),
    check('lastName').trim()
        .notEmpty().withMessage('Last name cannot be empty!')
        .isLength({min: 3, max: 50}).withMessage('Last name must be between 3 and 50 characters!'),
], authorController.postEdit);
router.post('/author/:authorId/delete', isAuth, authorController.deleteAuthor);
router.get('/author/:authorId/download-books', isAuth, authorController.getDownloadBooks);
router.get('/author/:authorId', isAuth, authorController.getAuthor);
router.post('/author/:authorId/add-author-to-publisher', isAuth, authorController.addAuthorToPublisher);


module.exports = router;