(function(c, d, w){
    const inputPhotoPerfil = d.querySelector("#input-photo-perfil"),
        openFile = d.querySelector("#openFile"),
        formInputPhoto = d.querySelector("#formInputPhoto"),
        spinnerContent = d.querySelector(".spinner-content");


    let pathName = window.location.pathname;
    if(pathName === '/home/dashboard'){
        document.querySelector(".dashboard-navigation-link:nth-child(1)").classList.add("dashboard-navigation-link-active");
    }else if(pathName === '/home/admin-site'){
        document.querySelector(".dashboard-navigation-link:nth-child(2)").classList.add("dashboard-navigation-link-active");
    }else if(pathName === '/home/adminBlog'){
        document.querySelector(".dashboard-navigation-link:nth-child(3)").classList.add("dashboard-navigation-link-active");
    }else if(pathName === '/home/users'){
        document.querySelector(".dashboard-navigation-link:nth-child(4)").classList.add("dashboard-navigation-link-active");
    }else{
        document.querySelector(".dashboard-navigation-link").classList.remove("dashboard-navigation-link-active");
    }


    openFile.addEventListener("click", function(e){
        e.preventDefault()
        // Abro el explorador de archivos de windows
        inputPhotoPerfil.click()


        // Lanzo el evento cuando se carga una imagen
        inputPhotoPerfil.addEventListener("change", function(){
            //c( d.querySelector('input[name="id_profile"]').value )
            if(this.files[0].type === "image/png" || this.files[0].type === "image/jpg" || this.files[0].type === "image/jpeg"){

                var data = new FormData()
                data.append('photo_perfil', this.files[0]);
                data.append('id_user', d.querySelector('input[name="id_profile"]').value)
                spinnerContent.innerHTML = `<div class="fa-3x"><i class=" fas fa-spinner fa-pulse"></i></div>`;
                fetch('/upload-image', {
                    method: 'POST',
                    body: data
                })
                    .then(response => response.json())
                    .then(success => {
                        c(success);
                        spinnerContent.style.display = "none";
                    })
                    .catch(error => c(error));
                return false;
            }else{
                c("Este tipo de archivo con Formato 'X' no puede ser cargado")
            }
        });
    });
})(console.log, document, window);
