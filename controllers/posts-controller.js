'use strict';
const PostsModel = require('../models/posts-model'),
    fs = require('fs'),
    webp = require('webp-converter'),
    { v4: uuidv4 } = require('uuid'),
    pm = new PostsModel();

webp.grant_permission();

class PostsController {
    newPost(req, res, next){
        if(req.session.user.length && req.session.user[0].rol != 2){
            let photoPost, name_photo, uploadPath;
            if(!req.files || Object.keys(req.files).length == 0)
                return res.status(400).json({error: "Ningun archivo fue cargado."});

            photoPost = req.files.image_post;
            name_photo = `${uuidv4()}.webp`;
            webp.cwebp(photoPost.tempFilePath, `/public/images/dashboard/post/${name_photo}`,"-q 70 -lossless");
            uploadPath = __dirname + '/../public/images/dashboard/post/' + name_photo;

            photoPost.mv(uploadPath, (err) => {
                if (err){
                    fs.unlink(`${__dirname}/../public/images/dashboard/${name_photo}`, function(err){
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('File is deleted.');
                        }
                    });
                    res.status(500).json(err);
                }else{
                    let post = {
                        title: req.body.title_txt,
                        brief: req.body.brief_txt,
                        content: req.body.content_txt,
                        image: name_photo,
                        status: req.body.status,
                        category_id: req.body.category_slc,
                        user_id: req.body.idUser
                    };
                    pm.newPost(post, (err, data) => {
                        if(err)
                            res.status(500).json({error: "No se pudo insertar el post, hubo un error en la BD", err});
                        else{
                            res.status(200).json({message: "Se ha insertado con exito el post"});
                        }
                    });
                }
            });
        };
    }
    getOnePost(req, res, next){
        if(req.session.user  && req.session.user[0].rol != 2){
            let idPost = req.params.id;
            pm.getAllCategories((err, categories) => {
                if(err)
                    console.log("No se pudo traer las categorias, hubo un error en la BD", err);
                else{
                    pm.getOnePost(idPost, (err, data) => {
                        if(err){
                            console.log(err);
                            res.status(500).json({error: "Hubo un error en la BD, vuelve a intentarlo mas tarde", err});
                        }
                        else{
                            res.render('editPost', {
                                title: "Editando Post de Blog",
                                userLogued: req.session.user[0],
                                post: data[0],
                                categories,
                                menuSend: global.menuSend
                            });
                        }
                    });
                }
            });

        }else res.redirect('/login');
    }
    editPost(req, res, next){
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

            if(req.files){
                photoPost = req.files.image_post;
                //name_photo = path.parse(req.body.name_image_post).name;
                //name_photo = `${req.body.name_image_post.replace(/\.[^/.]+$/, "")}`;
                name_photo = `${req.body.name_image_post}`;

                const convertImageToWebp = webp.cwebp(photoPost.tempFilePath, `/../public/images/dashboard/post/${name_photo}`,"-q 70 -lossless");

                uploadPath = __dirname + '/../public/images/dashboard/post/' + name_photo;

                photoPost.mv(uploadPath, (errorImage) => {
                    if (!errorImage){
                        console.log("Se subio la imagen")
                    }
                });
            }
            pm.editPost(post, name_photo, postId, (err, data) => {
                if(err)
                    res.status(500).json({error: "Hubo un error en la Base de Datos, vuelve a intentarlo más tarde",err});
                else{
                    res.json({success: "Se ha actualizado con exito el Post"});
                }
            });
        }
    }
    deletePost(req, res, next){
        if(req.session.user.length && req.session.user[0].rol != 2){
            let id = req.params.id;
            pm.getImagePost(id, (err, data) => {
                if(!err){
                    //Asignando nombre de la imagen
                    let nameOfImage = data[0].image;
                    //Eliminando imagen del servidor(de la carpeta donde se almacenan las imagenes)__dirname + '/../
                    fs.unlink(`${__dirname}/../public/images/dashboard/post/${nameOfImage}`, function(err){
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('File is deleted.');
                            pm.deletePost(id, (err, data) => {
                                if(err)
                                    return next( new Error('Registro no Encontrado') );
                                else
                                    res.redirect('/home/adminBlog')
                            });
                        }
                    });
                }
            });
        }
    }
    validatePostPublic(req, res, next){
        if(req.session.user && req.session.user[0].rol == 0){
            let post = {
                id: req.body.id_post,
                val: req.body.validate
            };
            pm.validatePostPublic(post, (err, data) => {
                if(!err){
                    res.status(200).json({message: "Se valido la publicación con exito."})
                }else res.status(200).json({message: "Hubo un error no se pudo validar la publicación."});
            });
        }
    }
    adminBlog(req, res, next){
        if(req.session.user  && req.session.user[0].rol != 2){
            pm.getAllCategories((err, category) => {
                if(err)
                    res.status(500).json({error: "No se pudo traer los datos, hubo un error en la BD", err});
                else{
                    let idUser = req.session.userId;
                    pm.adminBlog(idUser, (err, posts) => {
                        if(err)
                            res.status(500).json({error: "No se pudo traer los datos, hubo un error en la BD"});
                        else{
                            res.render('adminBlog', {
                                title: "Administrar Blogs - Introspect",
                                userLogued: req.session.user[0],
                                categories: category,
                                posts: posts,
                                menuSend: global.menuSend
                            });
                        }
                    });
                }
            });
        }else res.redirect('/login');
    }
}
module.exports = PostsController;
