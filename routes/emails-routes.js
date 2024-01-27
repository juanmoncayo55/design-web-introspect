.post('/send-email-admin', (req, res, next) => {
    req.getConnection((err, conn) => {
        let message = {
            fullname: req.body.fullname,
            email: req.body.email_contacto,
            subject: req.body.title_message,
            message: req.body.message_contacto
        }
        conn.query("INSERT INTO email_message SET ?", message, (err, data) => {
            if(!err){
                res.status(201).json({message: "Se ha enviado tu correo"});
            }else res.status(500).json({message: "Hubo un error en la consulta a la BD", error: err});
        });
    });
})
.post('/update-change-reading-email', (req, res, next) => {
    //console.log(req.body)
    req.getConnection((err, conn) => {
        let cmt = {
            id: req.body.idComment,
            check: req.body.check
        };
        conn.query("UPDATE email_message SET reading = ? WHERE id = ?", [cmt.check, cmt.id], (err, data) => {
            if(!err){
                res.status(200).json({message: "Se registro el correo como leido."});
            }else{
                res.status(500).json({message: "No se registro como leido el mensaje, hubo un error.", error});
            }
        });
    });
})
