'use strict';
const CommentsController = require('../controllers/comments-controller'),
    express = require('express'),
    router = express.Router(),
    cc = new CommentsController();

router
    .get("/getAllComments/:idPost", cc.getAllComments)
    .post('/add-comment-of-blog', cc.addCommentOfBlog)
    .post('/sum-liked-comment', cc.sumLikedComment);

module.exports = router;
