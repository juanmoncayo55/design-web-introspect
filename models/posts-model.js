'use strict';
const conn = require('./model');

class PostsModel {
    newPost(post, cb){
        conn.query("INSERT INTO post SET ?", post, cb);
    }
    getOnePost(idPost, cb){
        conn.query(`SELECT post.id, post.title, post.brief, post.content, post.image, post.created_at, post.status, post.category_id, post.user_id, users.first_name, users.last_name, users.email, users.user_name, users.imagen_avatar, category.name AS 'categoria' FROM post INNER JOIN users ON post.user_id = users.id INNER JOIN category ON post.category_id = category.id  WHERE post.id = ${idPost}`, cb);
    }
    editPost(post, name_photo, postId, cb){
        let newPost = {
            ...post,
            image: name_photo
        }
        conn.query(`UPDATE post SET ? WHERE id = ${postId}`, newPost, cb);
    }
    deletePost(id, cb){
        conn.query(`DELETE FROM post WHERE id = ${id}`, cb);
    }
    validatePostPublic(post, cb){
        conn.query(`UPDATE post SET validate = ${post.val} WHERE id = ${post.id}`, cb);
    }
    adminBlog(idUser, cb){
        conn.query(`SELECT * FROM post WHERE user_id = ${idUser} ORDER BY id DESC`, cb);
    }
    getAllCategories(cb){
        conn.query('SELECT id, name FROM category', cb);
    }
    getImagePost(idPost, cb){
        conn.query(`SELECT image FROM post WHERE id = ${idPost}`, cb);
    }
}
module.exports = PostsModel;
