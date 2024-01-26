'use strict';

const mysql = require('mysql'),
    myConnection = require('express-myconnection'),
    dbOptions = {
        host: "localhost",
        user: "root",
        password: "",
        port: 3306,
        database: "introspect"
    },
    conn = myConnection(mysql, dbOptions, 'request');

module.exports = conn;
