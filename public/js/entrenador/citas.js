$(document).ready(function(){
    populateAppointmentsList();

    var recordProgressForm = $("#record_progress_form")[0];

    $("#record_btn").click(function(e){
        var isValid = recordProgressForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            recordUserProgress(userSelected);
        }
        recordProgressForm.classList.add('was-validated');
    });
});

function populateAppointmentsList(){
    citasRef = db.collection("citas");
    
    citasRef.where("estado", "==", "Pendiente").orderBy("fechaInMillis").onSnapshot((querySnapshot) => {
        $("#appointments_firebase_list").empty();
        querySnapshot.forEach((appointment) => {
            db.collection("users").doc(appointment.data().usuario).get().then((usuario) =>{
                if(usuario.exists) {
                    $("#appointments_firebase_list").append(
                        `<div class="row list-row text-center" id="${appointment.data().usuario}">
                            <h6 class="col-md-3">${usuario.data().name}</h6>
                            <h6 class="col-md-2">${appointment.data().fecha}</h6>
                            <h6 class="col-md-2">${appointment.data().hora} hrs</h6>
                            <h6 class="col pointer" onclick="showProgressRecordForm(\`${usuario.id}\`,\`${usuario.data().name}\`,\`${appointment.id}\`)">Registrar avances</h6>  
                            <h6 class="col">Modificar</h6>
                            <h6 class="col text-danger">Eliminar <i class="col bi bi-stopwatch-fill" style="visibility: hidden;"></i></h6>
                        </div>`
                    );
                }
                else{
                }
            });
            
        });
    });
}

userSelected = -1;
appointmentIdSelected = -1;

function showProgressRecordForm(userId, userName, appointmentId){
    userSelected = userId;
    appointmentIdSelected = appointmentId;
    hideAndShow('#dates_list', '#profile_register');
    console.log("Holi: " + userName);
    $("#selected_user").empty().append(`Usuario: ` + userName);
}

function recordUserProgress(userSelected){
    _tipoCuerpo = getFormValue("#body_type_form");
    _peso = getFormValue("#weight_form");
    _estatura = getFormValue("#height_form");
    _imc = getFormValue("#imc_form");
    _cuello = getFormValue("#neck_measure_form");
    _brazoIzquierdo = getFormValue("#left_arm_measure_form");
    _brazoDerecho = getFormValue("#right_arm_measure_form");
    _antebrazoIzquierdo = getFormValue("#antebrazo_izquierdo_form");
    _antebrazoDerecho = getFormValue("#antebrazo_derecho_form");
    _toracico = getFormValue("#toracico_mesoesternal_form");
    _abdominalMinimo = getFormValue("#abdominal_minimo_form");
    _periumbilical = getFormValue("#periumbilical_form");
    _gluteoMaximo = getFormValue("#gluteo_maximo_form");
    _musloIzquierdo = getFormValue("#muslo_izquierdo_form");
    _musloDerecho = getFormValue("#muslo_derecho_form");
    _piernaIzquierda = getFormValue("#pierna_maxima_izquierda_form");
    _piernaDerecha = getFormValue("#pierna_maxima_derecha_form");
    _objetivos = getFormValue("#objetivos_form");
    _padecimientos = getFormValue("#padecimientos_form");
    _observaciones = getFormValue("#observaciones_form");
    db.collection("users").doc(userSelected).collection("progress").add({
        fecha: Date.now(),
        tipoCuerpo: _tipoCuerpo,
        peso: _peso,
        estatura: _estatura,
        imc: _imc,
        cuello: _cuello,
        brazoIzquierdo: _brazoIzquierdo,
        brazoDerecho: _brazoDerecho,
        antebrazoIzquierdo: _antebrazoIzquierdo,
        antebrazoDerecho: _antebrazoDerecho,
        toracico: _toracico,
        abdominalMinimo: _abdominalMinimo,
        periumbilical: _periumbilical,
        gluteoMaximo: _gluteoMaximo,
        musloIzquierdo: _musloIzquierdo,
        musloDerecho: _musloDerecho,
        piernaIzquierda: _piernaIzquierda,
        piernaDerecha: _piernaDerecha,
        objetivos: _objetivos,
        observaciones: _observaciones
    })
    .then((docRef) =>{
        db.collection("citas").doc(appointmentIdSelected).update({
            estado: "Realizada"
        });
        db.collection("users").doc(userSelected).collection("citas").doc(appointmentIdSelected).update({
            estado: "Realizada"
        });
    }).catch((error) =>{

    });
    hideAndShow('#profile_register', '#dates_list');
}