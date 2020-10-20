const express = require('express');

const router = express.Router();

// router.get('*', (req, res, next) => {
//     res.redirect('/books');
// });

router.use('/', (req, res, next) => {
    res.render('not-found', {
        title: 'Not found'
    })
});


// router.use((error, req, res, next) => {
//     // res.status(error.httpStatusCode).render(...);
//     // res.redirect('/500');
//     res.status(500).render('error', {
//       title: 'Error!',
//       path: '/500',
//       isAuthenticated: req.session.isLoggedIn
//     });
//   });

module.exports = router;