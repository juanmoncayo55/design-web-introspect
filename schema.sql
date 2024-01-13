DROP DATABASE IF EXISTS countrys;
CREATE DATABASE IF NOT EXISTS countrys;
USE countrys;

CREATE TABLE countrys(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL
)ENGINE=InnoDB  DEFAULT CHARSET=latin1;


ALTER TABLE users
ADD CONSTRAINT FK_usersConuntry
FOREIGN KEY (country) REFERENCES countrys(id);


SELECT users.id, users.first_name, users.last_name, users.mob_no, users.user_name, users.password, users.email, users.imagen_avatar, users.country, users.area_working, countrys.name_country FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id = 6;


SELECT * FROM users INNER JOIN countrys ON users.country = countrys.id WHERE users.id = 8








CREATE TABLE category(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL
)ENGINE=InnoDB  DEFAULT CHARSET=latin1;

CREATE TABLE post(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	brief VARCHAR(500) NOT NULL,
	content text NOT NULL,
	image VARCHAR(30) NOT NULL,
	created_at datetime NOT NULL,
	status boolean NOT NULL,
	category_id int,
	user_id int
)ENGINE=InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE post
ADD CONSTRAINT FK_postUser
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE post
ADD CONSTRAINT FK_postCategory
FOREIGN KEY (category_id) REFERENCES category(id);


CREATE TABLE comment(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	comment VARCHAR(255) NOT NULL,
	email VARCHAR(200) NOT NULL,
	created_at datetime,
	status int NOT NULL,
	post_id int
)ENGINE=InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE comment
ADD CONSTRAINT FK_commentPost
FOREIGN KEY (post_id) REFERENCES post(id);
