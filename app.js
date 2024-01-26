'use strict';

const express = require('express'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	fileUpload = require('express-fileupload'),
	mailer = require('express-mailer'),
	cors = require('cors'),
	morgan = require('morgan'),
	routes = require('./routes/index'),
	favicon = require('serve-favicon')(`${__dirname}/public/favicon.png`),
	publicDir = express.static(`${__dirname}/public`),
	viewDir = `${__dirname}/views`,
	port = (process.env.PORT || 3000);

let app = express();

app
	.set('views', viewDir)
	.set('view engine', 'pug')
	.set('port', port)

	.use(bodyParser.json())
	.use(bodyParser.urlencoded({extended: false}))
	.use(cors())
	.use(publicDir)
	.use(favicon)
	.use(morgan('dev'))
	.use(fileUpload({
		useTempFiles: true,
		tempFileDir: 'public/images/dashboard/tmp/',
		limits: {
			filesize: 2 * 1024 * 1024
		}
	}))
	.use(session({
		secret: 'user admin',
		resave: false,
		saveUninitialized: true,
		cookie: {maxAge: 30 * 60 * 1000}
	}))
	.use(routes);

mailer.extend(app, {
  form: 'juanmoriones012@gmail.com',
  host: 'smtp.gmail.com',
  secureConnection: true,
  port: 465,
  transportMethod: 'SMTP',
  auth: {
	user: 'juansebastianmoriones@unimayor.edu.co',
	pass: 'rvac fstz pxgn nxew'
  }
})

app.post('/send-email', (req, res, next) => {
	app.mailer.send({
		template: 'email',
		cc: req.body.email
		}, {
		to: 'juansebastianmoriones@gmail.com',
		subject: req.body.name,
		otherProperty: req.body.message
	}, function (err) {
		if (err) {
			console.log(err);
			res.send('There was an error sending the email');
			return;
		}else{
			console.log(req.body);
			res.status(200).json({message: "Se envio el correo correctamente!!!"});
		}
	});
})
module.exports = app;
