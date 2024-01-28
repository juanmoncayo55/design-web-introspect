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
    .use(error404);
module.exports = router;
