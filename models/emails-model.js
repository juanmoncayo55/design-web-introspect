const conn = require('./model');

class EmailsModel {
    sendEmailAdmin(message, cb){
        conn.query(`INSERT INTO email_message SET ${message}`, cb);
    }
    updateChangeReadingEmail(comment, cb){
        conn.query(`UPDATE email_message SET reading = ${comment.check} WHERE id = ${comment.id}`, cb);
    }
}

module.exports = EmailsModel;
