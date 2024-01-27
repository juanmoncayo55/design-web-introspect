'use strict';
const conn = require('./model');

class UsersModel {
    addUser(data, cb){
        conn.query(`INSERT INTO users SET ${data}`, cb);
    }
    getAllUsers(idUser, cb){
        conn.query(`SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id != ${idUser} ORDER BY users.id DESC`, cb);
    }
    getOneUserForEdit(id, cb){
        conn.query(`SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id = ${id}`, cb);
    }
    editProfileUser(data, cb){
        conn.query(`UPDATE users SET ${data.user} WHERE id = ${data.idUser}`, cb);
    }
    updatePermissionUser(data, cb){
        conn.query(`UPDATE users SET rol = ${data.rol}, validate = ${data.val} WHERE id = ${data.id}`, cb);
    }
    deleteUser(id, cb){
        conn.query(`DELETE FROM users WHERE id = ${id}`, cb);
    }
    updateImage(data, cb){
        conn.query(`UPDATE users SET imagen_avatar = ${data.name_photo} WHERE id = ${data.id}`, cb);
    }
    uploadImages(data, cb){
        conn.query(`UPDATE users SET imagen_avatar = ${data.name_photo} WHERE id = ${data.id}`, cb);
    }
    getImageUser(idUser, cb){
        conn.query(`SELECT imagen_avatar FROM users WHERE id = ${idUser}`, cb);
    }
    getAllCountrys(cb){
        conn.query('SELECT id AS id_country, name_country FROM countrys ORDER BY name_country ASC', cb);
    }
}
module.exports = UsersModel;
