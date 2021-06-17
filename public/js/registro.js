$(document).ready(function(){
    wasPressed = false;

    nextBtn = $("#next_btn");
    registrarBtn = $("#registrar_btn")
    step1 = $("#step-1");
    step2 = $("#step-2");

    limitDateInput();
    
    var form = $("#registro_form")[0];

    $("#regresar_step_1").click(function(e){
        $("#form_password").attr("required", "");
        $("#form_password_2").attr("required", "");
        $("#step-1").show();
        $("#step-2").hide();
        $("#continue_btn").show();
        $("#registrar_btn").hide();
    });

    $("#continue_btn").click(function(e){
        $("#step-2").show();
        $("#step-1").hide();
        $("#continue_btn").hide();
        $("#registrar_btn").show();
    });


    nextBtn.click(function(e){
        var isValid = form.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            $("#next_btn").hide();
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
        $("#form_password").attr("required", "");
        $("#form_password_2").attr("required", "");
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

        if(_password != _confirmPassword){
            displayAlertPanel("Las contraseñas no coinciden");
        }else{
            removeAlertPanel();
            var db = firebase.firestore();

        firebase.auth().createUserWithEmailAndPassword(_email, _password)
            .then((userCredential) => {
                    //Signed in
                    var user = userCredential.user;
                    db.collection("users").doc(user.uid).set({
                        name: _name,
                        genre: _genre,
                        email: _email,
                        birthDate: _birthDate,
                        role: _role,
                        uid: user.uid
                    })
                    .then(() => {
                        //console.log("Document written with ID: ", docRef.id);
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
                    displayFirebaseAuthError(errorCode, '#alerts_panel');
                    //alert(errorCode + " " + errorMessage);
            });
        }
    }
});

function limitDateInput(){
    var dtToday = new Date();
    dtToday.setMilliseconds(dtToday.getMilliseconds() - 568025136000);

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();

    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();

    var maxDate = year + '-' + month + '-' + day;    
    $('#form_birth_date').attr('max', maxDate);
}



