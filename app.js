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
	fileUpload = require('express-fileupload'),
	dbOptions = {
		host: "localhost",
		user: "root",
		password: "",
		port: 3306,
		database: "introspect"
	},
	conn = myConnection(mysql, dbOptions, 'request'),
	path = require('path'),
	cors = require('cors');

let app = express();

//app.use(fileUpload);

app.set('views', viewDir);
app.set('view engine', 'pug');
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(fileUpload());
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

// Upload Image
app.post('/upload-image', (req, res, next) => {
	let photoPerfil;
	let uploadPath;
	if(!req.files || Object.keys(req.files).length == 0){
		return res.status(400).json({message: "Ningun archivo fue cargado."});
	}
	photoPerfil = req.files.photo_perfil;
	uploadPath = __dirname + '/public/images/dashboard/' + photoPerfil.name;

	photoPerfil.mv(uploadPath, (err) => {
		if (err)
		      return res.status(500).send(err);
		else{
			//console.log("Url del archivo: ", uploadPath);
			//console.log("photoPerfil: ", photoPerfil.name);
			let id_profile = req.body.id_user,
				name_photo = photoPerfil.name;

			req.getConnection((err, conn) =>{
				// users SET first_name = ? WHERE id = ${idUser}
				conn.query("UPDATE users SET imagen_avatar = ? WHERE id = ?", [name_photo, id_profile], (err, data) => {
					if(err)
						res.status(502).json({error: "Error en la Base de Datos"});
					else{
						res.status(200).json({success: "Archivo subido con exito :D"});
					}
				});
			});

		}
	});
});
// End - Upload Image

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
				res.render('dashboard', {title: "Dashboard", user: data[0], userLogued: req.session.user[0]});
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
			conn.query("SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id = ?", req.session.userId, (err, data) => {
				console.log(data)
				res.render('profile', {title: "Información del usuario", user: data[0], userLogued: req.session.user[0]})
			});
		});
	}else{
		res.redirect('/login');
	}
});
// End - Profile

app.post('/edit-profile-user', (req, res, next) => {
	req.getConnection((err, conn) => {
		let user = {
			first_name: req.body.firstName_txt,
			last_name: req.body.lastName_txt,
			email: req.body.email_txt,
			mob_no: Number(req.body.mob_no_txt),
			user_name: req.body.nickname_txt,
			area_working: req.body.areaWorking_txt
		},
			idUser = req.body.id_profile;
		console.log("Informacion Usuario:", user);
		//conn.query("UPDATE users SET first_name = ?, last_name = ?, email = ?, mob_no = ?, user_name = ?, area_working = ? WHERE id = ?", [user.first_name, user.last_name, user.email, user.mob_no, user.user_name, user.area_working, idUser], (err, data) => {
		//conn.query(`UPDATE users SET first_name = ${user.first_name}, last_name = ${user.last_name}, email = ${user.email}, mob_no = ${user.mob_no}, user_name = ${user.user_name}, area_working = ${user.area_working} WHERE id = ${idUser}`, (err, data) => {
		conn.query("UPDATE users SET ? WHERE id = ?",[user, idUser], (err, data) => {
			if(!err){
				console.log(data);
				if(idUser == req.session.userId){
					req.session.user[0].first_name = user.first_name;
					req.session.user[0].last_name = user.last_name;
					req.session.user[0].user_name = user.user_name;
				}
				res.redirect('/home/dashboard');
			}else{
				console.log("Error SQL", err)
				res.redirect('/home/profile');
			}
		});
		if(err) console.log("Error de Conexion:", err)
	});
});

// View Users
app.get('/home/users', (req, res, next) => {
	if(req.session.user){
		req.getConnection((err, conn) => {
			let idUser = req.session.userId
			conn.query(`SELECT * FROM users WHERE id != ${idUser}`, (err, data) => {
				if(!err){
					console.log(data);
					res.render('users', { title: "Usuarios de Introspect", userLogued: req.session.user[0], users: data });
				}else console.log("Error: ", err)
			});
		});
	}else{
		res.redirect('/login');
	}
});
// End- View Users

// Edit user
app.get('/home/edit-user/:id', (req, res, next) => {
	if(req.session.user){
		req.getConnection((err, conn) => {
			let id = req.params.id;
			console.log("ID: ", id)
			conn.query("SELECT * FROM users WHERE users.id = ?", id, (err, data) => {
				//console.log(data)
				res.render('profile', {title: "Información del usuario", user: data[0], userLogued: req.session.user[0]})
			});
		});
	}else{
		res.redirect('/login');
	}
});
// End -Edit user

// Delete user
app.get('/home/delete-user/:id', (req, res, next) => {
	req.getConnection((err, conn) => {
		let id = req.params.id;
		conn.query("DELETE FROM users WHERE id = ?", id, (err, data) => {
			if(err)
				return next( new Error('Registro no Encontrado') );
			else
				res.redirect('/home/users')
		});
	});
});
// End - Delete user

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

// Page Not Found (404)
app.use((req, res, next) => {
	let err = new Error();
	err.status = 404;
	err.message = "Página No Encontrada";

	console.log(err);

	res.render('error', { error: err })
});

app.listen(app.get('port'), () => console.log(`Estamos escuchando por la URL: http://localhost:${app.get('port')}`));
