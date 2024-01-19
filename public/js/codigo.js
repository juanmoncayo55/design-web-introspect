(function(c, d, w){

    const inputPhotoPerfil = d.querySelector("#input-photo-perfil"),
        openFile = d.querySelector("#openFile"),
        formInputPhoto = d.querySelector("#formInputPhoto"),
        spinnerContent = d.querySelector(".spinner-content"),
        linkToMenuDash = d.querySelectorAll(".dashboard-navigation-link");

    let pathName = window.location.pathname;
    linkToMenuDash.forEach(function(item, i){
        if(pathName === '/home/dashboard'){
            (item.textContent == "Inicio")
                ? item.classList.add("dashboard-navigation-link-active")
                : item.classList.remove("dashboard-navigation-link-active")
        }else if(pathName === '/home/admin-site'){
            (item.textContent == "Editar Sitio")
                ? item.classList.add("dashboard-navigation-link-active")
                : item.classList.remove("dashboard-navigation-link-active")
        }else if(pathName === '/home/adminBlog'){
            (item.textContent == "Blog")
                ? item.classList.add("dashboard-navigation-link-active")
                : item.classList.remove("dashboard-navigation-link-active")
        }else if(pathName === '/home/users'){
            (item.textContent == "Usuarios")
                ? item.classList.add("dashboard-navigation-link-active")
                : item.classList.remove("dashboard-navigation-link-active")
        }else{
            linkToMenuDash.classList.remove("dashboard-navigation-link-active");
        }
    });

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
