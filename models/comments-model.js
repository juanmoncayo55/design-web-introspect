const conn = require('./model');

class CommentsModel {
    getAllComments(idPost, cb){
        conn.query(`SELECT comment.id, comment.name, comment.comment, comment.email, comment.created_at, comment.liked, users.first_name, users.last_name, users.imagen_avatar FROM comment INNER JOIN post ON post.id = comment.post_id INNER JOIN users ON comment.email = users.email WHERE comment.post_id = ${idPost} ORDER BY comment.created_at DESC`, cb);
    }
    addCommentOfBlog(comment, cb){
        conn.query(`INSERT INTO comment SET ${comment}`, cb);
    }
    sumLikedComment(idComment, cb){
        conn.query(`UPDATE comment SET comment.liked = comment.liked + 1 WHERE id = ${idComment}`, cb);
    }
    restLikedComment(idComment, cb){
        conn.query(`UPDATE comment SET comment.liked = comment.liked - 1 WHERE id = ${idComment}`, cb);
    }
}

module.exports = CommentsModel;
