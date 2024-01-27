.post('/new-post', (req, res, next) => {
    if(req.session.user.length && req.session.user[0].rol != 2){
        req.getConnection((err, conn) => {
            let photoPost, name_photo, uploadPath;
            if(!req.files || Object.keys(req.files).length == 0){
                return res.status(400).json({error: "Ningun archivo fue cargado."});
            }

            photoPost = req.files.image_post;
            name_photo = `${uuidv4()}.webp`;
            webp.cwebp(photoPost.tempFilePath, `/public/images/dashboard/post/${name_photo}`,"-q 70 -lossless");
            uploadPath = __dirname + '/../public/images/dashboard/post/' + name_photo;

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
})
.get('/home/edit-post/:id', (req, res, next) => {
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
                    res.render('editPost', {title: "Editando Post de Blog", userLogued: req.session.user[0], post: data[0], categories, menuSend: global.menuSend});
                }
            });
        });
    }else res.redirect('/login');
})
.post('/edit-post', (req, res, next) => {
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
})
.get('/home/delete-post/:id', (req, res, next) => {
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
})
.post('/validate-post-public', (req, res, next) => {
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
})
.get('/home/adminBlog', (req, res, next) => {
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
                            res.render('adminBlog', {title: "Administrar Blogs - Introspect", userLogued: req.session.user[0], categories: categories, posts: posts, menuSend: global.menuSend});
                        }
                    });

                }
            });
        });
    }else res.redirect('/login');
})
