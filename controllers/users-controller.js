'use strict';
const UsersModel = require('../models/users-model'),
    fs = require('fs'),
    webp = require('webp-converter'),
    um = new UsersModel();

webp.grant_permission();

class UsersController {

    addUser(req, res, next){
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

            //Antes de agregar la informacion del usuario, realizo la verificacion de la subida del archivo.
            if(!req.files || Object.keys(req.files).length == 0){
                return res.status(400).json({message: "Ningun archivo fue cargado."});
            }
            photoPerfil = req.files.image_user_file
            um.addUser(user, (err, data) => {
                if(err) res.status(500).json({error: "No se inserto el usuario", error: err});
                else{
                    name_photo = `${data.insertId}.webp`;
                    const convertImageToWebp = webp.cwebp(photoPerfil.tempFilePath, `/../public/images/dashboard/${name_photo}`,"-q 70 -lossless");
                    uploadPath = __dirname + '/../public/images/dashboard/' + name_photo;

                    photoPerfil.mv(uploadPath, (err) => {
                        if (err){
                            fs.unlink(`${__dirname}/../public/images/dashboard/${name_photo}`, function(err){
                                if (err) {
                                    console.error(err);
                                  } else {
                                    console.log('File is deleted.');
                                  }
                            });
                            res.status(500).json(err);
                        }
                        else{
                            let id_profile = data.insertId;
                            let dataImage = {
                                name_photo: name_photo,
                                id: data.insertId
                            }
                            console.log(dataImage);
                            um.updateImage(dataImage, (err, data) => {
                                if(err)
                                    res.status(502).json({error: "Error en la Base de Datos", err});
                                else{
                                    res.status(200).json({success: "Archivo subido con exito :D, y registro de usuario correcto", namePhoto: name_photo});
                                }
                            });
                        }
                    });
                }
            });

        } // Fin if de validacion de login
    } // Fin metodo addUser
    getAllUsers(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            let idUser = req.session.userId;
            um.getAllCountrys((err, paises) => {
                    if(err) res.send(400).json({error: "Hubo un error en la consulta SQL", error: err})
                    else{
                        um.getAllUsers(idUser, (err, data) =>{
                            if(!err){
                                res.render('users', {
                                    title: "Usuarios de Introspect",
                                    userLogued: req.session.user[0],
                                    users: data,
                                    paises,
                                    menuSend: global.menuSend
                                });
                            }else console.log("Error: ", err);
                        });
                    }
            });
        }else{
            res.redirect('/login');
        }
    }
    getOneUserForEdit(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            //Creando una variable para insertar los paises en forma de objetos
            let paises;
            let id = req.params.id;
            //Trayendo los paises de la base de datos
            um.getAllCountrys((err, paises) => {
                if(err) res.send(400).json({error: "Hubo un error en la consulta SQL", error: err})
                else{
                    um.getOneUserForEdit(id, (err, data) => {
                        res.render('profile', {
                            title: "Información del usuario",
                            user: data[0],
                            userLogued: req.session.user[0],
                            paises: paises,
                            menuSend: global.menuSend
                        });
                    });
                }
            });
        }else{
            res.redirect('/login');
        }
    }
    editProfileUser(req, res, next){
        let dataUser = {
            user: {
                first_name: req.body.firstName_txt,
                last_name: req.body.lastName_txt,
                email: req.body.email_txt,
                mob_no: Number(req.body.mob_no_txt),
                user_name: req.body.nickname_txt,
                country: req.body.pais_slc,
                area_working: req.body.areaWorking_txt
            },
            idUser: req.body.id_profile
        };
        um.editProfileUser(dataUser, (err, data) => {
            if(!err){
                console.log(data);
                if(dataUser.idUser == req.session.userId){
                    req.session.user[0].first_name = dataUser.user.first_name;
                    req.session.user[0].last_name = dataUser.user.last_name;
                    req.session.user[0].user_name = dataUser.user.user_name;
                }
                res.redirect('/home/dashboard');
            }else{
                console.log("Error SQL", err)
                res.redirect('/home/profile');
            }
        });
    }
    updatePermissionUser(req, res, next){
        if(req.session.user.length && req.session.user[0].rol == 0){
            let u = {
                id: req.body.id_user,
                rol: req.body.rol_slc,
                val: req.body.validate
            };
            um.updatePermissionUser(u, (err, data) => {
                if(!err){
                    console.log(data);
                    res.status(200).json({message: "Los permisos fueron cambiados correctamente."});
                }else res.status(502).json({error: "No se pudo actualizar los Datos."});
            });
        }
    }
    deleteUser(req, res, next){
        if(req.session.user.length && req.session.user[0].rol == 0){
            let idUser = req.params.id;
            um.getImageUser(idUser, (err, data) => {
                if(!err){
                    //Asignando nombre de la imagen
                    let nameOfImage = data[0].imagen_avatar;
                    //Eliminando imagen del servidor(de la carpeta donde se almacenan las imagenes)
                    fs.unlink(`${__dirname}/../public/images/dashboard/${nameOfImage}`, function(err){
                        if (err) {
                            console.error(err);
                          } else {
                            um.deleteUser(idUser, (err, data) => {
                                if(err)
                                    return next( new Error('Registro no Encontrado') );
                                else
                                    res.redirect('/home/users')
                            });
                            console.log('File is deleted.');
                          }
                    });

                }else console.log(err)
            });
        }
    }
    uploadImages(req, res, next){
        let photoPerfil, uploadPath, formatImageUpload, name_photo;
        if(!req.files || Object.keys(req.files).length == 0){
            return res.status(400).json({message: "Ningun archivo fue cargado."});
        }
        photoPerfil = req.files.photo_perfil;
        formatImageUpload = photoPerfil.mimetype.substr(6,9);
        name_photo = `${req.body.id_user}.webp`;

        //Hacemos la conversion "webp" del archivo a subir
        const convertImageToWebp = webp.cwebp(req.files.photo_perfil.tempFilePath, `/../public/images/dashboard/${name_photo}`,"-q 70 -lossless");
        //Rescibo la respuesta de la conversion de la imagen (Por defecto nos devuelve un error, por eso lo comentamos)

        //Direccion donde se encuentra alojada la imagen en la carpeta de trabajo
        uploadPath = __dirname + '/../public/images/dashboard/' + name_photo;
        //uploadPath = `${__dirname}/public/images/dashboard/${req.session.userId}.${formatImageUpload}`;

        //Movemos el archivo a la carpeta del servidor
        photoPerfil.mv(uploadPath, (err) => {
            if (err){
                fs.unlink(`${__dirname}/../public/images/dashboard/${name_photo}`, function(err){
                    if (err) {
                        console.error(err);
                      } else {
                        console.log('File is deleted.');
                      }
                });
                res.status(500).json(err);
            }
            else{
                //console.log("Url del archivo: ", uploadPath);
                //console.log("photoPerfil: ", photoPerfil.name);
                let id_profile = req.body.id_user;
                let dataUploadImages = {
                    name_photo: name_photo,
                    id: id_profile
                };
                um.uploadImages(dataUploadImages, (err, data) => {
                    if(err)
                        res.status(502).json({error: "Error en la Base de Datos", err});
                    else{
                        res.status(200).json({success: "Archivo subido con exito :D", namePhoto: name_photo});
                    }
                });
            }
        });
    }
}
module.exports = UsersController;
