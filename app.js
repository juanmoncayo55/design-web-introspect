'use strict';

const express = require('express'),
	pug = require('pug'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	favicon = require('serve-favicon')(`${__dirname}/public/favicon.png`),
	publicDir = express.static(`${__dirname}/public`),
	viewDir = `${__dirname}/views`,
	port = (process.env.PORT || 3000),
	mysql = require('mysql'),
	myConnection = require('express-myconnection'),
	fileUpload = require('express-fileupload'),
	webp = require('webp-converter'),
	dbOptions = {
		host: "localhost",
		user: "root",
		password: "",
		port: 3306,
		database: "introspect"
	},
	conn = myConnection(mysql, dbOptions, 'request'),
	path = require('path'),
	cors = require('cors'),
	jsonfile = require('jsonfile');

const { v4: uuidv4 } = require('uuid');

let app = express();

const mailer = require('express-mailer');
mailer.extend(app, {
  form: 'juanmoriones012@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
	user: 'juansebastianmoriones@unimayor.edu.co',
	pass: 'rvac fstz pxgn nxew'
  }
});
//app.use(fileUpload);

app.set('views', viewDir);
app.set('view engine', 'pug');
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: 'public/images/dashboard/tmp/',
	limits: {
		filesize: 2 * 1024 * 1024 // 2mb limit
	}
}));
app.use(publicDir);
app.use(favicon);

app.use(conn);

//Declaramos esta variable global que necesitamos guardar el menu de administrador para acceder desde cualquier peticion en el servidor
var menuSend;

// En la cookie le damos el maximo de tiempo de 30 minutos(30 * 60 * 1000)
app.use(session({
	secret: 'user admin',
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge: 30 * 60 * 1000}
}));

webp.grant_permission();

//Llamando nuestro archivo con los textos de 'Somos'
const urlFileSomos = `${__dirname}/textSomos.json`;

/****************--- DIRECCIONES PARA Pàginas de LadingPage ---****************/
// Index(Home)
app.get('/', (req, res, next) => {
	res.render('index', {title: "Introspect"});
});
// End - Index(Home)
// Páginas
app.get('/somos', (req, res, next) => {
	jsonfile.readFile(urlFileSomos, function (err, obj) {
		if (err) console.error(err)
		else{
			res.render('somos', {title: "Quienes Somos - Introspect", obj})
		}
	})
});

app.get('/blog', (req, res, next) => {
	req.getConnection((err, conn) => {
		conn.query("SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, post.user_id, category.name AS 'nombre_categoria', users.user_name AS 'nombre_usuario' FROM post INNER JOIN category ON post.category_id = category.id INNER JOIN users ON post.user_id = users.id WHERE post.status = 0 AND post.validate = 1 ORDER BY post.created_at DESC", (err, data) => {
			if(err)
				res.status(502).json({error: "No se logró traer la información de la base de datos, hubo un error en el gestor de base de datos."});
			else res.render('blog', {title: "Sección de Blog - Introspect", posts: data});
		});
	});
});
/*app.get('/blog/titulo-de-blog', (req, res, next) => {
	res.render('postOfBlog', {title: "Sección de Blog - Introspect"});
});*/
app.get('/blog/:id', (req, res, next) => {
	let idPost = req.params.id;
	//SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, category.name AS "nombre_categoria" FROM post INNER JOIN category ON post.category_id = category.id WHERE id = ?

	req.getConnection((err, conn) => {
		conn.query("SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, category.name AS 'nombre_categoria' FROM post INNER JOIN category ON post.category_id = category.id WHERE post.id = ? AND post.validate = 1", idPost, (err, data) => {
			if(err)
				res.status(502).json({error: "No se logró traer la información de la base de datos, hubo un error en el gestor de base de datos."});
			else res.render('postOfBlog', {title: "Sección de Blog - Introspect", post: data[0], user: (req.session.user != null)?true:false});
		});
	});
});
app.get('/contactanos', (req, res, next) => {
	res.render('contactanos', {title: "Contactanos - Introspect"});
});
// End - Páginas

/****************--- DIRECCIONES PARA LOGIN & LOGOUT ---****************/
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
	let formatImageUpload;
	let name_photo;
	if(!req.files || Object.keys(req.files).length == 0){
		return res.status(400).json({message: "Ningun archivo fue cargado."});
	}
	photoPerfil = req.files.photo_perfil;
	formatImageUpload = photoPerfil.mimetype.substr(6,9);
	name_photo = `${req.body.id_user}.webp`;
	//console.log(req.files.photo_perfil)

	//Hacemos la conversion "webp" del archivo a subir
	const convertImageToWebp = webp.cwebp(req.files.photo_perfil.tempFilePath, `/public/images/dashboard/${name_photo}`,"-q 70 -lossless");
	//Rescibo la respuesta de la conversion de la imagen (Por defecto nos devuelve un error, por eso lo comentamos)
	/*convertImageToWebp.then((response) => {
		console.log(response);
	});*/

	//Direccion donde se encuentra alojada la imagen en la carpeta de trabajo
	uploadPath = __dirname + '/public/images/dashboard/' + name_photo;
	//uploadPath = `${__dirname}/public/images/dashboard/${req.session.userId}.${formatImageUpload}`;

	//Movemos el archivo a la carpeta del servidor
	photoPerfil.mv(uploadPath, (err) => {
		if (err)
		      return res.status(500).json(err);
		else{
			//console.log("Url del archivo: ", uploadPath);
			//console.log("photoPerfil: ", photoPerfil.name);
			let id_profile = req.body.id_user;

			req.getConnection((err, conn) =>{
				// users SET first_name = ? WHERE id = ${idUser}
				conn.query("UPDATE users SET imagen_avatar = ? WHERE id = ?", [name_photo, id_profile], (err, data) => {
					if(err)
						res.status(502).json({error: "Error en la Base de Datos"});
					else{
						res.status(200).json({success: "Archivo subido con exito :D", namePhoto: name_photo});
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
		conn.query("SELECT id, first_name, last_name, user_name, email, validate, imagen_avatar, rol FROM users WHERE user_name = ? AND password = ?", [user_name, password], (err, data) => {
			if(!err){
				if(data.length){
					//console.log(data);
					if(data[0].validate === 1){
						console.log("Login user: ", data[0]);
						req.session.userId = data[0].id;
						req.session.user = data;
						res.redirect('/home/dashboard');
					}else{
						res.render('login', {message: "Tu cuenta aún no ha sido activada por el administrador, ponte en contacto con el para más información."});
					}
				}else{
					console.log("Login Incorrect ", data)
					res.render('login', {message: "Credenciales incorrectas"});
				}
			}
		});
	});
});
// End - Login


/****************--- DIRECCIONES PARA (DASHBOARD) ---****************/
app.get('/home/admin-site', (req, res, next) => {
	if(req.session.user && req.session.user[0].rol == 0){
		res.render('editSitePage', {title: "Sección para editar Landing Page", userLogued: req.session.user[0], menuSend: menuSend});
	}else res.redirect('/login')
});
app.get('/home/admin-site/somos-edit-information', (req, res, next) => {
	if(req.session.user && req.session.user[0].rol == 0){
		jsonfile.readFile(urlFileSomos, function (err, obj) {
			if (err) console.error(err)
			else{
				res.render('sectionEditSomos', {title: "Editando Página de Somos", userLogued: req.session.user[0], content: obj, menuSend: menuSend});
			}
		})
	}else res.redirect('/login')
});
app.post('/somos-information-edit', (req, res, next) => {
	if(req.session.user.length && req.session.user[0].rol == 0){
		jsonfile.writeFile(urlFileSomos, req.body, function (err) {
			if (!err) res.status(200).json({message: "Se edito correctamente el contenido."})
			else console.error(err)
		});
	}
});
app.get('/home/admin-site/administrator-users', (req, res, next) => {
	if(req.session.user && req.session.user[0].rol == 0){
		req.getConnection((err, conn) => {
			conn.query("SELECT id, first_name, last_name, user_name, rol, validate FROM users WHERE rol != 0 ORDER BY id DESC", (err, data) => {
				if(!err){
					console.log(data)
					res.render('administratorUsers', {
						title: "Administrando usuarios",
						userLogued: req.session.user[0],
						menuSend: menuSend,
						data
					});
				}else res.status(502).json({error: "Hubo un error en la Base de datos, por favor contacte al administrador."});
			});
		});
	}else res.redirect('/login')
});
app.get('/home/admin-site/administrator-post', (req, res, next) => {
	if(req.session.user && req.session.user[0].rol == 0){
		req.getConnection((err, conn) => {
			conn.query("SELECT id, title, validate FROM post WHERE validate = 0 ORDER BY id DESC", (err, data) => {
				if(!err){
					res.render('administratorPost', {
						title: "Administrando publicaciones",
						userLogued: req.session.user[0],
						menuSend: menuSend,
						posts: data
					});
				}else res.status(200).json({message: "No encontraron registros."});
			});
		});
	}else res.redirect('/login')
});
app.post('/validate-post-public', (req, res, next) => {
	if(req.session.user && req.session.user[0].rol == 0){
		req.getConnection((err, conn) => {
			let post = {
				id: req.body.id_post,
				val: req.body.validate
			};
			conn.query("UPDATE post SET validate = ? WHERE id = ?", [post.val, post.id], (err, data) => {
				if(!err){
					res.status(200).json({message: "Se valido la publicación con exito."})
				}else res.status(200).json({message: "Hubo un error no se pudo validar la publicación."});
			});
		});
	}
});
app.get('/home/admin-site/administrator-email', (req, res, next) => {
	if(req.session.user && req.session.user[0].rol == 0){
		res.render('administratorEmails', {title: "Administrando Correos electronicos", userLogued: req.session.user[0], menuSend: menuSend});
	}else res.redirect('/login')
});
/****************--- DIRECCIONES PARA Users (DASHBOARD) ---****************/
// Dashboard
app.get('/home/dashboard', (req, res, next) => {
	let userId = req.session.userId,
		user = req.session.user;
	const buildMenu = {
		"menuAdmin": [
			{url:"/home/dashboard", name:"Inicio"},
			{url:"/home/admin-site", name:"Editar Sitio"},
			{url:"/home/adminBlog", name:"Blog"},
			{url:"/home/users", name:"Usuarios"},
			{url:"#", name:"Calendar"}
		],
		"menuPublish": [
			{url:"/home/dashboard", name:"Inicio"},
			{url:"/home/adminBlog", name:"Blog"},
			{url:"#", name:"Calendar"}
		],
		"menuInteraction": [
			{url:"/home/dashboard", name:"Inicio"},
			{url:"#", name:"Calendar"}
		]
	}
	if(user == undefined){
		res.redirect('/login');
		return;
	}else if(user.length){
		console.log("Sesion en Login: ", req.session)
		req.getConnection((err, conn) => {
			conn.query("SELECT * FROM users WHERE id = ?", user[0].id, (err, data) => {
				if(data[0].rol == 0)
					menuSend = buildMenu.menuAdmin;
				else if(data[0].rol == 1)
					menuSend = buildMenu.menuPublish;
				else if(data[0].rol == 2)
					menuSend = buildMenu.menuInteraction;
				res.render('dashboard', {
					title: "Dashboard",
					home: true,
					user: data[0],
					userLogued: req.session.user[0],
					menuSend: menuSend
				});
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
			//Creando una variable para insertar los paises en forma de objetos
			let paises;
			//Trayendo los paises de la base de datos
			conn.query('SELECT id AS id_country, name_country FROM countrys ORDER BY name_country ASC', (err, data) => {
				if(err) res.send(400).json({error: "Hubo un error en la consulta SQL"})
				else paises = data;
			});

			conn.query("SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id = ?", req.session.userId, (err, data) => {
				console.log(data)
				res.render('profile', {title: "Información del usuario", user: data[0], userLogued: req.session.user[0], paises: paises, menuSend: menuSend})
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
			country: req.body.pais_slc,
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
	if(req.session.user && req.session.user[0].rol == 0){
		req.getConnection((err, conn) => {

			let paises;
			conn.query('SELECT id AS id_country, name_country FROM countrys ORDER BY name_country ASC', (err, data) => {
				if(err) res.send(400).json({error: "Hubo un error en la consulta SQL"})
				else paises = data;
			});

			let idUser = req.session.userId;
			conn.query(`SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id != ${idUser} ORDER BY users.id DESC`, (err, data) => {
				if(!err){
					console.log(data);
					res.render('users', { title: "Usuarios de Introspect", userLogued: req.session.user[0], users: data, paises, menuSend: menuSend});
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
	if(req.session.user && req.session.user[0].rol == 0){
		req.getConnection((err, conn) => {
			let id = req.params.id;

			//Creando una variable para insertar los paises en forma de objetos
			let paises;
			//Trayendo los paises de la base de datos
			conn.query('SELECT id AS id_country, name_country FROM countrys ORDER BY name_country ASC', (err, data) => {
				if(err) res.send(400).json({error: "Hubo un error en la consulta SQL"})
				else paises = data;
			});

			conn.query("SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id = ?", id, (err, data) => {
				res.render('profile', {title: "Información del usuario", user: data[0], userLogued: req.session.user[0], paises: paises, menuSend})
			});
		});
	}else{
		res.redirect('/login');
	}
});
// End -Edit user

// Delete user
app.get('/home/delete-user/:id', (req, res, next) => {
	if(req.session.user.length && req.session.user[0].rol == 0){
		req.getConnection((err, conn) => {
			let id = req.params.id;
			conn.query("SELECT imagen_avatar FROM users WHERE id = ?", id, (err, data) => {
				if(!err){
					//Asignando nombre de la imagen
					let nameOfImage = data[0].imagen_avatar;
					//Eliminando imagen del servidor(de la carpeta donde se almacenan las imagenes)
					fs.unlink(`${__dirname}/public/images/dashboard/${nameOfImage}`, function(err){
						if (err) {
							console.error(err);
						  } else {
							console.log('File is deleted.');
						  }
					});
					conn.query("DELETE FROM users WHERE id = ?", id, (err, data) => {
						if(err)
							return next( new Error('Registro no Encontrado') );
						else
							res.redirect('/home/users')
					});
				}else console.log(err)
			});


		});
	}
});
// End - Delete user

// Add User
app.post('/user-add', (req, res, next) => {
	//console.log(req.files)
	//console.log(req.body);
	if(req.session.user.length && req.session.user[0].rol == 0){
		let photoPerfil, name_photo, uploadPath, id_user;

		let user = {
			first_name: req.body.firstName_txt,
			last_name: req.body.lastName_txt,
			mob_no: req.body.mobileNumber_text,
			user_name: req.body.nickname_txt,
			password: req.body.password_psw,
			email: req.body.email_txt,
			country: req.body.pais_slc,
			area_working: req.body.areaWorking_txt
		}
		req.getConnection((err, conn) => {
			//Antes de agregar la informacion del usuario, realizo la verificacion de la subida del archivo.
			if(!req.files || Object.keys(req.files).length == 0){
				return res.status(400).json({message: "Ningun archivo fue cargado."});
			}
			photoPerfil = req.files.image_user_file;

			conn.query('INSERT INTO users SET ?', user,(err, data) => {
				if(err) res.status(500).json({error: "No se inserto el usuario"});
				else{
					name_photo = `${data.insertId}.webp`;

					const convertImageToWebp = webp.cwebp(photoPerfil.tempFilePath, `/public/images/dashboard/${name_photo}`,"-q 70 -lossless");

					uploadPath = __dirname + '/public/images/dashboard/' + name_photo;

					photoPerfil.mv(uploadPath, (err) => {
						if (err)
						      return res.status(500).json(err);
						else{
							let id_profile = data.insertId;
							req.getConnection((err, conn) =>{
								conn.query("UPDATE users SET imagen_avatar = ? WHERE id = ?", [name_photo, data.insertId], (err, data) => {
									if(err)
										res.status(502).json({error: "Error en la Base de Datos"});
									else{
										res.status(200).json({success: "Archivo subido con exito :D, y registro de usuario correcto", namePhoto: name_photo});
									}
								});
							});
						}
					});

					//res.status(200).json({message: "Se registro el usuario correctamente", data});
				}
			});
		});
	}
});
// End - Add User

// Edit permissions for Admin
app.post('/update-permissions-user', (req, res, next) => {
	if(req.session.user.length && req.session.user[0].rol == 0){
		req.getConnection((err, conn) => {
			let u = {
				id: req.body.id_user,
				rol: req.body.rol_slc,
				val: req.body.validate
			};
			conn.query("UPDATE users SET rol = ?, validate = ? WHERE id = ?;", [u.rol, u.val, u.id], (err, data) => {
				if(!err){
					res.status(200).json({message: "Los permisos fueron cambiados correctamente."});
				}else res.status(502).json({error: "No se pudo actualizar los Datos."});
			});
		});
	}
});
// End - Edit permissions for Admin

/****************--- DIRECCIONES PARA BLOG'S (DASHBOARD) ---****************/
// Blog
app.get('/home/adminBlog', (req, res, next) => {
	if(req.session.user  && req.session.user[0].rol != 2){
		/*let posts;
		req.getConnection((err, conn) => {
			conn.query("SELECT * FROM post WHERE user_id = ?", req.session.userId, (err, data) => {
				if(err)
					res.status(500).json({error: "No se pudo traer los datos, hubo un error en la BD"});
				else{
					posts = data;
				}
			});
		});*/
		req.getConnection((err, conn) => {
			conn.query('SELECT id, name FROM category', (err, categories) => {
				if(err)
					res.status(500).json({error: "No se pudo traer los datos, hubo un error en la BD"});
				else{
					conn.query("SELECT * FROM post WHERE user_id = ? ORDER BY id DESC", req.session.userId, (err, posts) => {
						if(err)
							res.status(500).json({error: "No se pudo traer los datos, hubo un error en la BD"});
						else{
							res.render('adminBlog', {title: "Administrar Blogs - Introspect", userLogued: req.session.user[0], categories: categories, posts: posts, menuSend: menuSend});
						}
					});

				}
			});
		});
	}else res.redirect('/login');
});
// End - Blog

// Insert a new Post

//app.get('/new-post', (req, res, next) => {});
app.post('/new-post', (req, res, next) => {
	if(req.session.user.length && req.session.user[0].rol != 2){
		req.getConnection((err, conn) => {
			let photoPost, name_photo, uploadPath;
			if(!req.files || Object.keys(req.files).length == 0){
				return res.status(400).json({error: "Ningun archivo fue cargado."});
			}

			photoPost = req.files.image_post;
			name_photo = `${uuidv4()}.webp`;
			webp.cwebp(photoPost.tempFilePath, `/public/images/dashboard/post/${name_photo}`,"-q 70 -lossless");
			uploadPath = __dirname + '/public/images/dashboard/post/' + name_photo;

			photoPost.mv(uploadPath, (err) => {
				if (err)
					  return res.status(500).json(err);
				else{
					req.getConnection((err, conn) =>{
						let post = {
							title: req.body.title_txt,
							brief: req.body.brief_txt,
							content: req.body.content_txt,
							image: name_photo,
							status: req.body.status,
							category_id: req.body.category_slc,
							user_id: req.body.idUser
						};
						conn.query('INSERT INTO post SET ?', post, (err, data) => {
							if(err)
								res.status(500).json({error: "No se pudo insertar el post, hubo un error en la BD"});
							else{
								res.status(200).json({message: "Se ha insertado con exito el post"});
							}
						});
					});
				}
			});
		});
	}
});
// End - Insert a new Post

// View section edit post
app.get('/home/edit-post/:id', (req, res, next) => {
	if(req.session.user  && req.session.user[0].rol != 2){
		let idPost = req.params.id;
		let categories;

		req.getConnection((err, conn) => {
			conn.query('SELECT id, name FROM category', (err, data) => {
				if(err)
					console.log("No se pudo traer las categorias, hubo un error en la BD", err);
				else{
					categories = data;
				}
			});
		});

		req.getConnection((err, conn) => {
			//SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, post.user_id, users.first_name, users.last_name, users.imagen_avatar, category.name AS "categoria" FROM post INNER JOIN users ON post.user_id = users.id INNER JOIN category ON post.category_id = category.id  WHERE post.id = 1;
			conn.query("SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, post.user_id, users.first_name, users.last_name, users.email, users.user_name, users.imagen_avatar, category.name AS 'categoria' FROM post INNER JOIN users ON post.user_id = users.id INNER JOIN category ON post.category_id = category.id  WHERE post.id = ?", idPost, (err, data) => {
				if(err)
					res.status(500).json({error: "Hubo un error en la BD, vuelve a intentarlo mas tarde"});
				else{
					res.render('editPost', {title: "Editando Post de Blog", userLogued: req.session.user[0], post: data[0], categories, menuSend: menuSend});
				}
			});
		});
	}else res.redirect('/login');
});
// End - View section edit post

// Edit post
app.post('/edit-post', (req, res, next) => {
	//console.log(req.body);
	//console.log(req.files);
	if(req.session.user.length && req.session.user[0].rol != 2){
		let photoPost, name_photo, uploadPath;
		let postId = req.body.idPost;
		let post = {
			title: req.body.title_txt,
			brief: req.body.brief_txt,
			content: req.body.content_txt,
			status: req.body.status,
			category_id: req.body.category_slc
		}
		name_photo = `${req.body.name_image_post.replace(/\.[^/.]+$/, "")}.webp`;
		req.getConnection((err, conn) =>{


			if(req.files){
				photoPost = req.files.image_post;
				//name_photo = path.parse(req.body.name_image_post).name;
				//name_photo = `${req.body.name_image_post.replace(/\.[^/.]+$/, "")}`;
				name_photo = `${req.body.name_image_post}`;

				const convertImageToWebp = webp.cwebp(photoPost.tempFilePath, `/public/images/dashboard/post/${name_photo}`,"-q 70 -lossless");

				uploadPath = __dirname + '/public/images/dashboard/post/' + name_photo;

				photoPost.mv(uploadPath, (errorImage) => {
					if (!errorImage){
						console.log("Se subio la imagen")
						/*conn.query("UPDATE post SET image = ? WHERE id = ?", [name_photo, postId], (error, data) => {
							if(error)
								res.status(502).json({error: "Error en la Base de Datos"});
							else{
								res.json({success: "Archivo subido con exito :D, y registro de usuario correcto", namePhoto: name_photo});
							}
						});*/
					}
				});
			}
		});
		req.getConnection((err, conn) => {
			conn.query('UPDATE post SET ? WHERE id = ?', [{...post, image: name_photo}, postId], (err, data) => {
				if(err)
					res.status(500).json({error: "Hubo un error en la Base de Datos, vuelve a intentarlo ,ás tarde", err});
				else{
					res.json({success: "Se ha actualizado con exito el Post"});
				}
			});
		});
	}
});
// End - Edit post

// Delete Post of blog
app.get('/home/delete-post/:id', (req, res, next) => {
	if(req.session.user.length && req.session.user[0].rol != 2){
		req.getConnection((err, conn) => {
			let id = req.params.id;
			conn.query("SELECT image FROM post WHERE id = ?", id, (err, data) => {
				if(!err){
					//Asignando nombre de la imagen
					let nameOfImage = data[0].image;
					//Eliminando imagen del servidor(de la carpeta donde se almacenan las imagenes)
					fs.unlink(`${__dirname}/public/images/dashboard/post/${nameOfImage}`, function(err){
						if (err) {
						    console.error(err);
						  } else {
						    console.log('File is deleted.');
						  }
					});
					conn.query("DELETE FROM post WHERE id = ?", id, (err, data) => {
						if(err)
							return next( new Error('Registro no Encontrado') );
						else
							res.redirect('/home/adminBlog')
					});
				}
			});
			/*conn.query("DELETE FROM post WHERE id = ?", id, (err, data) => {
				if(err)
					return next( new Error('Registro no Encontrado') );
				else
					res.redirect('/home/blog')
			});*/
		});
	}
});
// End - Delete Post of blog

// Comments Of Blog
app.post('/add-comment-of-blog', (req, res, next) => {
	if(req.session.user){
		//console.log(req.session.user[0].email, req.body);
		let comment = {
			name: req.body.title_comment,
			comment: req.body.message_comment,
			email: req.session.user[0].email,
			post_id: req.body.idPost
		}
		req.getConnection((err, conn) => {
			conn.query("INSERT INTO comment SET ?", comment, (err, data) => {
				if(!err){
					console.log(data);
					res.status(200).json({message: "Se registro el comenario con exito."});
				}else res.status(500).json({message: "Hubo un error al hacer la petición a la base de datos.", error: err});
			});
		});
	}else res.status(403).json({message: "403 No has iniciado sesión"});
});
app.get("/getAllComments/:idPost", (req, res, next) => {
	req.getConnection((err, conn) => {
		conn.query("SELECT comment.id, comment.name, comment.comment, comment.email, comment.created_at, comment.liked, users.first_name, users.last_name, users.imagen_avatar FROM comment INNER JOIN post ON post.id = comment.post_id INNER JOIN users ON comment.email = users.email WHERE comment.post_id = ? ORDER BY comment.created_at DESC", req.params.idPost, (err, data) => {
			if(!err){
				console.log(data);
				res.status(200).json({comments: data});
			}else res.status(500).json({message: "Hubo un error al hacer la petición a la base de datos.", error: err});
		});
	});
});
app.post('/sum-liked-comment', (req, res, next) => {
	//console.log(req.body)
	req.getConnection((err, conn) => {
		if(req.body.value == "sumar"){
			conn.query("UPDATE comment SET comment.liked = comment.liked + 1 WHERE id = ?", req.body.id_comment, (err, data) => {
				if(!err){
					console.log(data)
					res.status(200).json({message: "Haz dado me gusta"})
				}
				else{ console.log(err);res.status(500).json({message: "Hubo un error"})}
			});
		}else if(req.body.value == "restar"){
			conn.query("UPDATE comment SET comment.liked = comment.liked - 1 WHERE id = ?", req.body.id_comment, (err, data) => {
				if(!err){
					console.log(data)
					res.status(200).json({message: "Haz un NO me gusta"})
				}
				else{ console.log(err);res.status(500).json({message: "Hubo un error"})}
			});
		}
		if(err) console.log(err)
	});
});
// End- Comments Of Blog

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

app.post('/send-email', (req, res, next) => {
	app.mailer.send({
		template: 'email',
		cc: req.body.email
		}, {
		to: 'juansebastianmoriones@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field.
		subject: req.body.name, // REQUIRED.
		otherProperty: req.body.message
	}, function (err) {
		if (err) {
			// handle error
			console.log(err);
			res.send('There was an error sending the email');
			return;
		}else{
			console.log(req.body);
			res.status(200).json({message: "Se envio el correo correctamente!!!"});
		}
	});
});
app.get("/email", (req, res, next) => res.render('email'));
// Page Not Found (404)
app.use((req, res, next) => {
	let err = new Error();
	err.status = 404;
	err.message = "Página No Encontrada";

	console.log(err);

	res.render('error', { error: err })
});

app.listen(app.get('port'), () => console.log(`Estamos escuchando por la URL: http://localhost:${app.get('port')}`));
