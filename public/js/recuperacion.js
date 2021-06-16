$(document).ready(function(){
    var recuperacionForm = $("#recuperacion_form")[0];

    $("#btn_recuperar").click(function(e){
        console.log("Prueba");
        var isValid = recuperacionForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            restorePassword();
        }
        recuperacionForm.classList.add('was-validated');
    });
});

function restorePassword(){
    var emailAddress = $("#form_email").val();
    var auth = firebase.auth();
    auth.sendPasswordResetEmail(emailAddress).then(function() {
        displaySuccessPanel("Se ha enviado un correo con instrucciones para recuperar su contraseña");
    }).catch(function(error) {
        console.log(error);
        displayAlertPanel(error);
    });
    
}