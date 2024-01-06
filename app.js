'use strict';

const express = require('express'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
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
	conn = myConnection(mysql, dbOptions, 'request'),
	path = require('path');
	//cors = require('cors');

let app = express();

app.set('views', viewDir);
app.set('view engine', 'pug');
app.set('port', port);

//app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(publicDir);
app.use(favicon);

app.use(conn);
// En la cookie le damos el maximo de tiempo de 30 minutos(30 * 60 * 1000)
app.use(session({
	secret: 'user admin',
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge: 30 * 60 * 1000}
}));

// Index(Home)
app.get('/', (req, res, next) => {
	res.render('index', {title: "Introspect"});
});
// End - Index(Home)

// Signup
app.get('/signup', (req, res, next) => {
	(req.session.user)
		? res.redirect('/home/dashboard')
		: res.render('signup', {title: "Formulario de Registro", message: null})

	console.log("/signup session: ", req.session);
});
app.post('/signup', (req, res, next) => {
	console.log("Signup POST: ", req.body);
	req.getConnection((err, conn) => {
		let user = {
			id: 0,
			first_name: req.body.firstName_txt,
			last_name: req.body.lastName_txt,
			mob_no: req.body.mobileNumber_text,
			user_name: req.body.nickname_txt,
			password: req.body.password_psw
		};

		conn.query("INSERT INTO users SET ?", user,(err, data) => {
			if(!err){
				//res.render('signup', {addUser: true, message: "Se Agrego un nuevo usuario"});
				res.redirect('/login');
			}else{
				res.render('signup', {message: "No se pudo agregar el usuario"});
			}
		});
	});
});
// End - Signup

// Login
app.get('/login', (req, res, next) => {
	(req.session.user)
		? res.redirect('/home/dashboard')
		: res.render('login', {title: "Inicio de sesión"});
});
app.post('/login', (req, res, next) => {
	req.getConnection((err, conn) => {
		let user_name = req.body.nickname_txt,
			password = req.body.password_psw;
		console.log(`Username: ${user_name}, Password: ${password}`);

		//conn.query("SELECT id, first_name, last_name, user_name FROM users WHERE user_name = '"+user_name+"' AND password = '"+password+"' ", (err, data) => {
		conn.query("SELECT id, first_name, last_name, user_name FROM users WHERE user_name = ? AND password = ?", [user_name, password], (err, data) => {
			if(!err){
				if(data.length){
					console.log("Login user: ", data[0]);
					req.session.userId = data[0].id;
					req.session.user = data;
					res.redirect('/home/dashboard');
				}else{
					console.log("Login Incorrect ", data)
					res.render('login', {message: "Credenciales incorrectas"});
				}
			}
		});
	});
});
// End - Login

// Dashboard
app.get('/home/dashboard', (req, res, next) => {
	let userId = req.session.userId,
		user = req.session.user;
	if(user == undefined){
		res.redirect('/login');
		return;
	}else{
		console.log("Sesion en Login: ", req.session)
		req.getConnection((err, conn) => {
			conn.query("SELECT * FROM users WHERE id = ?", user[0].id, (err, data) => {
				res.render('dashboard', {title: "Dashboard", data: data[0]});
				console.log("Dashboard Correcto: ", data);
			});
		});
	}
});
// End - Dashboard

// Profile
app.get('/home/profile', (req, res, next) => {
	if(req.session.user){
		req.getConnection((err, conn) => {
			conn.query("SELECT * FROM users WHERE id = ?", req.session.userId, (err, data) => {
				console.log(data)
				res.render('profile', {title: "Información del usuario", data: data[0]})
			});
		});
	}else{
		res.redirect('/login');
	}
});
// End - Profile

// Logout
app.get('/home/logout', (req, res, next) => {
	req.session.destroy(function(err) {
		if(!err){
			console.log(req.session);
			res.redirect("/login");
		}else console.log("Error destroy: ", err)
   })
});
// End - Logout






app.listen(app.get('port'), () => console.log(`Estamos escuchando por la URL: http://localhost:${app.get('port')}`));
