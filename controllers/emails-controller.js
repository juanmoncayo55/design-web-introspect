'use strict';
const EmailsModel = require('../models/emails-model'),
    em = new EmailsModel();

class EmailsController {
    sendEmailAdmin(req, res, next){
        let message = {
            fullname: req.body.fullname,
            email: req.body.email_contacto,
            subject: req.body.title_message,
            message: req.body.message_contacto
        }
        em.sendEmailAdmin(message, (err, data) => {
            if(!err){
                res.status(201).json({message: "Se ha enviado tu correo"});
            }else res.status(500).json({message: "Hubo un error en la consulta a la BD", error: err});
        });
    }
    updateChangeReadingEmail(req, res, next){
        let cmt = {
            id: req.body.idComment,
            check: req.body.check
        };
        em.updateChangeReadingEmail(cmt, (err, data) => {
            if(!err){
                res.status(200).json({message: "Se registro el correo como leido."});
            }else{
                res.status(500).json({message: "No se registro como leido el mensaje, hubo un error.", error});
            }
        });
    }
}

module.exports = EmailsController;
