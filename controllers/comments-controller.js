'use strict';
const CommentsModel = require('../models/comments-model'),
    fs = require('fs'),
    webp = require('webp-converter'),
    cm = new CommentsModel();

webp.grant_permission();

class CommentsController {
    getAllComments(req, res, next){
        cm.getAllComments(req.params.idPost, (err, data) => {
            if(!err){
                console.log(data);
                res.status(200).json({comments: data});
            }else res.status(500).json({message: "Hubo un error al hacer la petición a la base de datos.", error: err});
        });
    }
    addCommentOfBlog(req, res, next){
        if(req.session.user){
            let comment = {
                name: req.body.title_comment,
                comment: req.body.message_comment,
                email: req.session.user[0].email,
                post_id: req.body.idPost
            }
            cm.addCommentOfBlog(comment, (err, data) => {
                if(!err){
                    console.log(data);
                    res.status(200).json({message: "Se registro el comenario con exito."});
                }else res.status(500).json({message: "Hubo un error al hacer la petición a la base de datos.", error: err});
            });
        }else res.status(403).json({message: "403 No has iniciado sesión"});
    }
    sumLikedComment(req, res, next){
        if(req.session.user){
            req.getConnection((err, conn) => {
                if(req.body.value == "sumar"){
                    cm.sumLikedComment(req.body.id_comment, (err, data) => {
                        if(!err){
                            console.log(data)
                            res.status(200).json({message: "Haz dado me gusta"})
                        }
                        else{ console.log(err);res.status(500).json({message: "Hubo un error"})}
                    });
                }else if(req.body.value == "restar"){
                    cm.restLikedComment(req.body.id_comment, (err, data) => {
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
    }
}

module.exports = CommentsController;
