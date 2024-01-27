'use strict';
const CommentsController = require('../controllers/comments-controller'),
    express = require('express'),
    router = express.Router(),
    cc = new CommentsController();

router
    .get("/getAllComments/:idPost", getAllComments)
    .post('/add-comment-of-blog', addCommentOfBlog)
    .post('/sum-liked-comment', sumLikedComment);

module.exports = router;
