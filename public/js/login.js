$(document).ready(function(){
    var form = $("#login_form")[0];

    $("#btn_signIn").click(function (e){
        var isValid = form.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            signIn();
        }
        form.classList.add('was-validated');
    })

    function signIn(){
        _email = getFormValue("#form_email");
        _password = getFormValue("#form_password");

        var db = firebase.firestore();

        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            // Existing and future Auth states are now persisted in the current
            // session only. Closing the window would clear any existing state even
            // if a user forgets to sign out.
            // ...
            // New sign-in will be persisted with session persistence.
            return firebase.auth().signInWithEmailAndPassword(_email, _password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                //alert("Sesión iniciada correctamente: " + user.email)
                db.collection("users").where("uid", "==", user.uid)
                    .get()
                    .then((querySnapshot) => {
                        if(!querySnapshot.empty) {
                            role = querySnapshot.docs[0].data().role
                            if(role === "Entrenador"){
                                console.log("Entrenador");
                                location.href = "html/entrenador/usuarios.html";
                            }else if(role === "Nutriologo"){
                                console.log("Nutriologo");
                                location.href = "html/nutriologo/usuarios.html";
                            }else{
                                firebase.auth().signOut();
                                console.log("Esta cuenta es de un cliente");
                                $(".alert").show();
                            }
                        }else{
                            console.log("No se encontró ningun resultado");
                        }
                    })
                    .catch((error) => {
                        console.log("Error getting documents: ", error);
                    });
    
                // ...
            })
            .catch((error) => {
                var errorCode = error.code;
                displayFirebaseAuthError(errorCode);
                //var errorMessage = error.message;
                //alert(errorCode + " " + errorMessage);
            });
        })
        .catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
        });

        
    }
});