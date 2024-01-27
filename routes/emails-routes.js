'use strict';
const EmailsController = require('../controllers/emails-controller'),
    express = require('express'),
    router = express.Router(),
    ec = new EmailsController();

router
    .post('/send-email-admin', ec.sendEmailAdmin)
    .post('/update-change-reading-email', ec.updateChangeReadingEmail);

module.exports = router;
