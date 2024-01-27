'use strict';
const conn = require('./model');

class DashboardModel {
    dashboard(id, cb){
        conn.query(`SELECT * FROM users WHERE id = ${id}`, cb);
    }
    adminUsers(cb){
        conn.query("SELECT id, first_name, last_name, user_name, rol, validate FROM users WHERE rol != 0 ORDER BY id DESC", cb);
    }
    adminPost(cb){
        conn.query("SELECT id, title, validate FROM post WHERE validate = 0 ORDER BY id DESC", cb);
    }
    adminEmail(cb){
        conn.query("SELECT * from email_message WHERE reading = 0 ORDER BY id DESC", cb);
    }
    profile(id, cb){
        conn.query(`SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id = ${id}`, cb);
    }
    getAllCountries(cb){
        conn.query("SELECT id AS id_country, name_country FROM countrys ORDER BY name_country ASC", cb);
    }
}
module.exports = DashboardModel;
