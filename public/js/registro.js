$(document).ready(function(){
    nextBtn = $("#next_btn");
    registrarBtn = $("#registrar_btn")
    step1 = $("#step-1");
    step2 = $("#step-2");

    var form = $("#registro_form")[0];

    nextBtn.click(function(e){
        var isValid = form.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            next_step();   
        }
        form.classList.add('was-validated');
    });

    registrarBtn.click(function(e){
        var isValid = form.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            registrar();
        }
        form.classList.add('was-validated');
    });

    function next_step(){
        $("#form_password").attr("required", "")
        $("#form_password_2").attr("required", "")
        step1.hide();
        step2.show();
        nextBtn.hide();
        registrarBtn.show();
    }

    function registrar(){
        _name = getFormValue("#form_name");
        _email = getFormValue("#form_email");
        _genre = $("#form_genre option:selected").text();
        _birthDate = getFormValue("#form_birth_date");
        _role = getFormValue("#form_role");
        _password = getFormValue("#form_password");
        _confirmPassword = getFormValue("#form_password_2");

        var db = firebase.firestore();

        firebase.auth().createUserWithEmailAndPassword(_email, _password)
            .then((userCredential) => {
                //Signed in
                var user = userCredential.user;
                db.collection("users").add({
                    name: _name,
                    genre: _genre,
                    email: _email,
                    birthDate: _birthDate,
                    role: _role,
                    uid: user.uid
                })
                .then((docRef) => {
                    console.log("Document written with ID: ", docRef.id);
                    //alert("Registro realizado correctamente");
                    location.href = 'index.html';
                    /*if(_role === "Entrenador") location.href = 'html/entrenador/citas/citas.html';
                    else location.href = 'html/nutriologo/citas/citas.html';*/
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                });
        })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log("Holi");
                displayFirebaseAuthError(errorCode, '#alerts_panel');
                //alert(errorCode + " " + errorMessage);
        });
    }
});



