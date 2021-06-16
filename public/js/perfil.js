$(document).ready(function(){

    var form = $("#editar_perfil_form")[0];

    $("#editar_btn").click(function(e){
        var isValid = form.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            editProfile();
        }
        form.classList.add('was-validated');
    });

    limitDateInput();
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

function editProfile(){
    nombre = getFormValue("#form_name");
    fechaNacimiento = getFormValue("#form_birth_date");
    genero = $("#form_genre option:selected").text();

    if(currentUser != null){
        db.collection("users").doc(currentUser.uid).update({
            name: nombre,
            birthDate: fechaNacimiento,
            genre: genero
        })
        .then(() =>{
            // contrasenya = getFormValue("#form_password");
            // contrasenya2 = getFormValue("#form_password_2");
            // if(contrasenya == ""){

            // }
        })
        .catch((error) =>{

        });
    }

    
}

function showPasswordFields(){
    $("#password_panel").show();
}

var currentUser;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        currentUser = user;
        console.log("Loggeado");
        console.log(user.uid);
        db.collection("users").doc(user.uid).onSnapshot((userObject)=>{
            console.log(userObject.data());
            $("#form_name").val(userObject.data().name);
            $("#form_birth_date").val(userObject.data().birthDate);
            if(userObject.data().genre == "Masculino"){
                $("#form_genre").val("Masculino");
            }else{
                $("#form_genre").val("Femenino");
            }
            
        });
    } else {
        console.log("No Loggeado");
    }
});