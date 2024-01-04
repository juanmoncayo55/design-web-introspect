'use strict';

const express = require('express'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	favicon = require('serve-favicon')(`${__dirname}/public/favicon.png`),
	publicDir = express.static(`${__dirname}/public`),
	viewDir = `${__dirname}/views`,
	port = (process.env.PORT || 3000),
	mysql = require('mysql'),
	myConnection = require('express-myconnection'),
	dbOptions = {
		host: "localhost",
		user: "root",
		password: "",
		port: 3306,
		database: "introspect"
	},
	conn = myConnection(mysql, dbOptions, 'request');

let app = express();

app.set('views', viewDir);
app.set('view engine', 'pug');
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(publicDir);
app.use(favicon);

app.use(conn);


app.get('/', (req, res, next) => {
	res.render('index');
});

app.listen(app.get('port'), () => console.log(`Estamos escuchando por la URL: http://localhost:${app.get('port')}`));