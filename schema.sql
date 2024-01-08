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
