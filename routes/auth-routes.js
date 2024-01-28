'use strict';
const AuthController = require('../controllers/auth-controller'),
    express = require('express'),
    router = express.Router(),
    ac = new AuthController();

router
    .get('/signup', ac.signup)
    .post('/signup', ac.signupInsert)
    .get('/login', ac.login)
    .post('/login', ac.loginAuth)
    .get('/home/logout', ac.logout);

module.exports = router;
