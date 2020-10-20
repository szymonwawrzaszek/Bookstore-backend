const express = require('express');

const publisherController = require('../controllers/publisher-controller');
const isAuth = require('../middleware/is_auth')


const router = express.Router();

router.get('/publishers', isAuth, publisherController.getAll);
//router.get('/publisher/add', isAuth, publisherController.getAdd);
router.post('/publisher/add', isAuth, publisherController.postAdd);
router.post('/publisher/:publisherId/delete', isAuth, publisherController.deletePublisher);
router.post('/publisher/:publisherId/add-author', isAuth, publisherController.addAuthor);
router.post('/publisher/:publisherId/add-authors', isAuth, publisherController.addAuthors);
router.get('/publisher/:publisherId', isAuth, publisherController.getPublisher);

module.exports = router;