'use strict';
const UsersController = require('../controllers/users-controller'),
    express = require('express'),
    router = express.Router(),
    uc = new UsersController();

router
    .get('/home/users', uc.getAllUsers)
    .get('/home/edit-user/:id', uc.getOneUserForEdit)
    .delete('/home/delete-user/:id', uc.deleteUser)
    .post('/user-add', uc.addUser)
    .put('/edit-profile-user', uc.editProfileUser)
    .put('/update-permissions-user', uc.updatePermissionUser)
    .put('/upload-image', uc.uploadImages);

module.exports = router;
