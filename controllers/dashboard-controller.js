'use strict';
const DashboardModel = require('../models/dashboard-model'),
    fs = require('fs'),
    webp = require('webp-converter'),
    moment = require('moment'),
    jsonfile = require('jsonfile'),
    urlFileSomos = `${__dirname}/../textSomos.json`,
    dm = new DashboardModel();

class DashboardController {
    dashboard(req, res, next){
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
            dm.dashboard(user[0].id, (err, data) => {
                if(data[0].rol == 0)
                    global.menuSend = buildMenu.menuAdmin;
                else if(data[0].rol == 1)
                    global.menuSend = buildMenu.menuPublish;
                else if(data[0].rol == 2)
                    global.menuSend = buildMenu.menuInteraction;
                res.render('dashboard', {
                    title: "Dashboard",
                    home: true,
                    user: data[0],
                    userLogued: req.session.user[0],
                    menuSend: global.menuSend
                });
                console.log("Dashboard Correcto: ", data);
            });
        }
    }
    adminSite(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            res.render('editSitePage', {
                title: "Sección para editar Landing Page",
                userLogued: req.session.user[0],
                menuSend: global.menuSend
            });
        }else res.redirect('/login')
    }
    adminUsers(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            dm.adminUsers((err, data) => {
                if(!err){
                    console.log(data)
                    res.render('administratorUsers', {
                        title: "Administrando usuarios",
                        userLogued: req.session.user[0],
                        menuSend: global.menuSend,
                        data
                    });
                }else res.status(502).json({error: "Hubo un error en la Base de datos, por favor contacte al administrador."});
            });
        }else res.redirect('/login')
    }
    adminPost(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            dm.adminPost((err, data) => {
                if(!err){
                    res.render('administratorPost', {
                        title: "Administrando publicaciones",
                        userLogued: req.session.user[0],
                        menuSend: global.menuSend,
                        posts: data
                    });
                }else res.status(200).json({message: "No encontraron registros."});
            });
        }else res.redirect('/login')
    }
    adminEmail(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            dm.adminEmail((err, data) => {
                if(!err){
                    let newData = data.map((value, index, array) => {
                        return {...value, created_at: moment(value.created_at).locale('es').format("DD/MM/YY")}
                    });
                    res.render('administratorEmails', {
                        title: "Administrando Correos electronicos",
                        userLogued: req.session.user[0],
                        menuSend: global.menuSend,
                        emails: newData
                    });
                }else res.status(500).json({message: "Hubo un error en la consulta a la BD", error: err});
            });
        }else res.redirect('/login')
    }
    profile(req, res, next){
        if(req.session.user){
            //Creando una variable para insertar los paises en forma de objetos
            let paises;
            //Trayendo los paises de la base de datos
            dm.getAllCountries((err, data) => {
                    if(err) res.send(400).json({error: "Hubo un error en la consulta SQL"})
                    else paises = data;
            });
            dm.profile(req.session.userId, (err, data) => {
                console.log(data)
                res.render('profile', {
                    title: "Información del usuario",
                    user: data[0],
                    userLogued: req.session.user[0],
                    paises: paises,
                    menuSend: global.menuSend
                });
            });
        }else res.redirect('/login');
    }
    adminSiteSomosEditInformation(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            jsonfile.readFile(urlFileSomos, function (err, obj) {
                if (err) console.error(err)
                else{
                    res.render('sectionEditSomos', {
                        title: "Editando Página de Somos",
                        userLogued: req.session.user[0],
                        content: obj,
                        menuSend: global.menuSend
                    });
                }
            })
        }else res.redirect('/login')
    }
    somosEditInformation(req, res, next){
        if(req.session.user.length && req.session.user[0].rol == 0){
            jsonfile.writeFile(urlFileSomos, req.body, function (err) {
                if (!err) res.status(200).json({message: "Se edito correctamente el contenido."})
                else console.error(err)
            });
        }
    }
}
module.exports = DashboardController;
