'use strict';

const express = require('express'),
    fs = require('fs'),
    webp = require('webp-converter'),
    moment = require('moment'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    urlFileSomos = `${__dirname}/../textSomos.json`,
    { v4: uuidv4 } = require('uuid'),
    router = express.Router();

webp.grant_permission();

function error404(req, res, next){
    let err = new Error();
    err.status = 404;
    err.message = "Página No Encontrada";

    console.log(err);

    res.render('error', { error: err })
}
global.menuSend;
router
    .get('/', (req, res, next) => {
        res.render('index', {title: "Introspect", loggued: req.session.user != undefined ? true : false});
    })
    .get('/somos', (req, res, next) => {
        jsonfile.readFile(urlFileSomos, function (err, obj) {
            if (err) console.error(err)
            else{
                res.render('somos', {title: "Quienes Somos - Introspect", obj, loggued: req.session.user != undefined ? true : false})
            }
        })
    })
    .get('/blog', (req, res, next) => {
        req.getConnection((err, conn) => {
            conn.query("SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, post.user_id, category.name AS 'nombre_categoria', users.user_name AS 'nombre_usuario' FROM post INNER JOIN category ON post.category_id = category.id INNER JOIN users ON post.user_id = users.id WHERE post.status = 0 AND post.validate = 1 ORDER BY post.created_at DESC", (err, data) => {
                if(err)
                    res.status(502).json({error: "No se logró traer la información de la base de datos, hubo un error en el gestor de base de datos."});
                else res.render('blog', {title: "Sección de Blog - Introspect", posts: data, loggued: req.session.user != undefined ? true : false});
            });
        });
    })
    .get('/blog/:id', (req, res, next) => {
        let idPost = req.params.id;
        req.getConnection((err, conn) => {
            conn.query("SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, category.name AS 'nombre_categoria' FROM post INNER JOIN category ON post.category_id = category.id WHERE post.id = ? AND post.validate = 1", idPost, (err, data) => {
                if(err)
                    res.status(502).json({error: "No se logró traer la información de la base de datos, hubo un error en el gestor de base de datos."});
                else res.render('postOfBlog', {title: "Sección de Blog - Introspect", post: data[0], user: (req.session.user != null)?true:false, loggued: req.session.user != undefined ? true : false});
            });
        });
    })
    .get('/contactanos', (req, res, next) => {
        res.render('contactanos',{
            title: "Contactanos - Introspect",
            loggued: req.session.user != undefined ? true : false
        });
    })
    .get('/signup', (req, res, next) => {
        (req.session.user)
            ? res.redirect('/home/dashboard')
            : res.render('signup', {title: "Formulario de Registro", message: null, loggued: req.session.user != undefined ? true : false})

        console.log("/signup session: ", req.session);
    })
    .post('/signup', (req, res, next) => {
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
    })
    .get('/login', (req, res, next) => {
        (req.session.user)
            ? res.redirect('/home/dashboard')
            : res.render('login', {title: "Inicio de sesión", loggued: req.session.user != undefined ? true : false});
    })
    .post('/login', (req, res, next) => {
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
    })
    .get('/home/logout', (req, res, next) => {
        req.session.destroy(function(err) {
            if(!err){
                console.log(req.session);
                res.redirect("/login");
            }else console.log("Error destroy: ", err)
        })
    })
    .use(error404);
module.exports = router;
