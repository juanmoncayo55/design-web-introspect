.get("/getAllComments/:idPost", (req, res, next) => {
    req.getConnection((err, conn) => {
        conn.query("SELECT comment.id, comment.name, comment.comment, comment.email, comment.created_at, comment.liked, users.first_name, users.last_name, users.imagen_avatar FROM comment INNER JOIN post ON post.id = comment.post_id INNER JOIN users ON comment.email = users.email WHERE comment.post_id = ? ORDER BY comment.created_at DESC", req.params.idPost, (err, data) => {
            if(!err){
                console.log(data);
                res.status(200).json({comments: data});
            }else res.status(500).json({message: "Hubo un error al hacer la petición a la base de datos.", error: err});
        });
    });
})
.post('/add-comment-of-blog', (req, res, next) => {
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
})
.post('/sum-liked-comment', (req, res, next) => {
    //console.log(req.body)
    if(req.session.user){
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
    }else res.status(403).json({message: "403 No has iniciado sesión"});
})
