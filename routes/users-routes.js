'use strict';
const UsersController = require('../controllers/users-controller'),
    express = require('express'),
    router = express.Router(),
    uc = new UsersController();

router
    .post('/user-add', uc.addUser)
    .get('/home/users', uc.getAllUsers)
    .get('/home/edit-user/:id', uc.getOneUserForEdit)
    .post('/edit-profile-user', uc.editProfileUser)
    .post('/update-permissions-user', uc.updatePermissionUser)
    .get('/home/delete-user/:id', uc.deleteUser)
    .post('/upload-image', uc.uploadImages);

module.exports = router;
