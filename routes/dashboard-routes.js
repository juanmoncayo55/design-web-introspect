'use strict';
const DashboardController = require('../controllers/dashboard-controller'),
    express = require('express'),
    router = express.Router(),
    dc = new DashboardController();

router
    .get('/home/dashboard', dc.dashboard)
    .get('/home/admin-site', dc.adminSite)
    .get('/home/admin-site/administrator-users', dc.adminUsers)
    .get('/home/admin-site/administrator-post', dc.adminPost)
    .get('/home/admin-site/administrator-email', dc.adminEmail)
    .get('/home/profile', dc.profile)
    .get('/home/admin-site/somos-edit-information', dc.adminSiteSomosEditInformation)
    .post('/somos-information-edit', dc.somosEditInformation);

module.exports = router;
