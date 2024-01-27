'use strict';
const PostsController = require('../controllers/posts-controller'),
    express = require('express'),
    router = express.Router(),
    pc = new PostsController();

router
    .post('/new-post', pc.newPost)
    .get('/home/edit-post/:id', pc.getOnePost)
    .post('/edit-post', pc.editPost)
    .get('/home/delete-post/:id', pc.deletePost)
    .post('/validate-post-public', pc.validatePostPublic)
    .get('/home/adminBlog', pc.adminBlog);

module.exports = router;
