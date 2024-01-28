const AuthModel = require('../models/auth-model'),
    am = new AuthModel();

class AuthController {
    signup(req, res, next){
        (req.session.user)
            ? res.redirect('/home/dashboard')
            : res.render('signup', {title: "Formulario de Registro", message: null, loggued: req.session.user != undefined ? true : false})

        console.log("/signup session: ", req.session);
    }
    signupInsert(req, res, next){
        console.log("Signup POST: ", req.body);
        let user = {
            id: 0,
            first_name: req.body.firstName_txt,
            last_name: req.body.lastName_txt,
            mob_no: req.body.mobileNumber_text,
            user_name: req.body.nickname_txt,
            password: req.body.password_psw
        };
        am.signupInsert(user, (err, data) => {
            if(!err){
                res.redirect('/login');
            }else{
                res.render('signup', {message: "No se pudo agregar el usuario"});
            }
        });
    }
    login(req, res, next){
        (req.session.user)
            ? res.redirect('/home/dashboard')
            : res.render('login', {title: "Inicio de sesión", loggued: req.session.user != undefined ? true : false});
    }
    loginAuth(req, res, next){
        let user_name = req.body.nickname_txt,
            password = req.body.password_psw;
        console.log(`Username: ${user_name}, Password: ${password}`);
        let userLog = {user_name: user_name, password: password}
        am.loginAuth(userLog, (err, data) => {
            if(!err){
                if(data.length){
                    console.log(data);
                    if(data[0].validate == 1){
                        console.log("Login user: ", data[0]);
                        req.session.userId = data[0].id;
                        req.session.user = data;
                        res.redirect('/home/dashboard');
                    }else{
                        res.render('login', {message: "Tu cuenta aún no ha sido activada por el administrador, ponte en contacto con el para más información."});
                    }
                }else{
                    console.log("Login Incorrect ", data)
                    res.render('login', {message: "Credenciales incorrectas"});
                }
            }else console.log(err);
        });
    }
    logout(req, res, next){
        req.session.destroy(function(err) {
            if(!err){
                console.log(req.session);
                res.redirect("/login");
            }else console.log("Error destroy: ", err)
        })
    }
}

module.exports = AuthController;
