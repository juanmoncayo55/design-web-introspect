'use strict';
const PostsController = require('../controllers/posts-controller'),
    express = require('express'),
    router = express.Router(),
    pc = new PostsController();

router
    .get('/home/adminBlog', pc.adminBlog)
    .get('/home/edit-post/:id', pc.getOnePost)
    .delete('/home/delete-post/:id', pc.deletePost)
    .post('/new-post', pc.newPost)
    .put('/edit-post', pc.editPost)
    .put('/validate-post-public', pc.validatePostPublic);

module.exports = router;
