const conn = require('./model');

class AuthModel {
    signupInsert(user, cb){
        conn.query(`INSERT INTO users SET ${user}`, cb);
    }
    loginAuth(user, cb){
        conn.query(`SELECT id, first_name, last_name, user_name, email, validate, imagen_avatar, rol FROM users WHERE user_name = "${user.user_name}" AND password = "${user.password}"`, cb);
    }
}

module.exports = AuthModel;
