$(document).ready(function(){
    n = new Date().getTime();
    console.log(n);

    populateAppointmentsList();
    // limitDatePicker();

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
    $("#btnCitasATiempo").hide();
    $("#btnCitasRetrasadas").show();

    citasRef = db.collection("citas");
    currentTimeInMillis = new Date().getTime() - 10 * 60000;
    citasRef.where("estado", "==", "Pendiente")
            .where("fechaInMillis", ">=", currentTimeInMillis)
            .orderBy("fechaInMillis").onSnapshot((querySnapshot) => {
                $("#appointments_firebase_list").empty();
                querySnapshot.forEach((appointment) => {
                    db.collection("users").doc(appointment.data().usuario).get().then((usuario) =>{
                        if(usuario.exists) {
                            $("#appointments_firebase_list").append(
                                `<div class="row list-row text-center" id="${appointment.data().usuario}">
                                    <h6 class="col-md-3">${usuario.data().name}</h6>
                                    <h6 class="col-md-2">${appointment.data().fecha}</h6>
                                    <h6 class="col-md-2">${appointment.data().hora} hrs</h6>
                                    <h6 class="col pointer" id="${appointment.id}_showProgressForm">Registrar avances</h6>  
                                    <h6 class="col pointer" id="${appointment.id}_edit">Modificar</h6>
                                    <h6 onclick="selectAppointmentToCancel(\`${appointment.id}\`)" class="col text-danger pointer"><strong>Cancelar cita</strong><i id='${appointment.id}_lateAppointment' class="col bi bi-stopwatch-fill" style="visibility: hidden;"></i></h6>
                                </div>`
                            );
                            $(`#${appointment.id}_showProgressForm`).on('click', function(){
                                showProgressRecordForm(usuario, appointment.id);
                            });
                            

                            $(`#${appointment.id}_edit`).on('click', function(){
                                editAppointment(appointment, usuario);
                            });
                            // if(appointment.data().fechaInMillis < new Date().getTime()){
                            //     $(`#${appointment.id}_lateAppointment`).css('visibility', 'visible');
                            // }
                        }
                        else{
                        }
                    });
        });
    });
}

currentAppointmentSelectedForEdit = -1;
originalDateFromAppointmentToEdit = -1;
originalHourFromAppointmentToEdit = -1;


function editAppointment(appointmentObject, userObject){
    currentAppointmentSelectedForEdit = appointmentObject;
    hideAndShow('#dates_list', '#edit_appointment');
    $("#username_appointment").empty().append(userObject.data().name);
    $("#date_picker").val(appointmentObject.data().fecha);
    $("#currentDateAssigned").empty().append(appointmentObject.data().fecha);
    $("#currentHourAssigned").empty().append(appointmentObject.data().hora);
    originalDateFromAppointmentToEdit = appointmentObject.data().fecha;
    originalHourFromAppointmentToEdit = appointmentObject.data().hora;
    console.log(originalDateFromAppointmentToEdit);
    console.log(originalHourFromAppointmentToEdit);
    resetTimeArrays();
    searchAvailableHours($('#date_picker').val());
}

function editFirebaseAppointment(){
    if(currentAppointmentSelectedForEdit != -1){
        //Edit firebase appointment 
        selectedDate = $("#date_picker").val();
        selectedTime = $("#time_picker option:selected").text();
    
        fixedDate = selectedDate.concat(" "+selectedTime);
        newDate = new Date(fixedDate);
        db.collection("citas").doc(currentAppointmentSelectedForEdit.id).update({
            fechaInMillis: newDate.getTime(),
            fecha: selectedDate,
            hora: selectedTime,
        })
        .then(() =>{
            db.collection("fechas").doc(selectedDate).set({
                horasOcupadas: firebase.firestore.FieldValue.arrayUnion(selectedTime)
            },{merge:true})
            .catch((error) =>{
                console.log(error);
            });
            db.collection("users").doc(currentAppointmentSelectedForEdit.data().usuario).collection("citas").doc(currentAppointmentSelectedForEdit.id).update({
                fechaInMillis: newDate.getTime(),
                fecha: selectedDate,
                hora: selectedTime,
            })
            .catch((error) =>{
                console.log(error);
            });

            db.collection("fechas").doc(originalDateFromAppointmentToEdit).set({
                horasOcupadas: firebase.firestore.FieldValue.arrayRemove(originalHourFromAppointmentToEdit)
            },{merge:true})
            .catch((error) =>{
                console.log(error);
            });
            location.reload();
        })
        .catch((error) =>{
    
        });
    }
}



function populateLateAppointmentsList(){
    $("#btnCitasATiempo").show();
    $("#btnCitasRetrasadas").hide();
    citasRef = db.collection("citas");
    currentTimeInMillis = new Date().getTime() - 10 * 60000;
    citasRef.where("estado", "==", "Pendiente")
            .where("fechaInMillis", "<=", currentTimeInMillis)
            .orderBy("fechaInMillis").onSnapshot((querySnapshot) => {
                $("#appointments_firebase_list").empty();
                querySnapshot.forEach((appointment) => {
                    db.collection("users").doc(appointment.data().usuario).get().then((usuario) =>{
                        if(usuario.exists) {
                            $("#appointments_firebase_list").append(
                                `<div class="row list-row text-center" id="${appointment.data().usuario}">
                                    <h6 class="col-md-3">${usuario.data().name}</h6>
                                    <h6 class="col-md-2">${appointment.data().fecha}</h6>
                                    <h6 class="col-md-2">${appointment.data().hora} hrs</h6>
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

function showProgressRecordForm(user, appointmentId){
    console.log("Holi");
    userSelected = user.id;
    appointmentIdSelected = appointmentId;
    hideAndShow('#dates_list', '#profile_register');
    $(".selected_user").empty().append(`Usuario: ` + user.data().name);

    $("#objetivos_form").val(user.data().objetivos);
    $("#padecimientos_form").val(user.data().ailments);
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

appointmentToCancelSelected = -1;

function selectAppointmentToCancel(appointmentId){
    appointmentToCancelSelected = appointmentId;
    console.log(appointmentToCancelSelected);
    showModal('#cancelAppointmentModal',true);
}

function cancelAppointment(){
    if(appointmentToCancelSelected != -1){
        showModal('#cancelAppointmentModal', false);
        db.collection("citas").doc(appointmentToCancelSelected).get().then((appointment)=>{
            if(appointment.exists){
                usuario = appointment.data().usuario;
                db.collection("users").doc(usuario).collection("citas").doc(appointmentToCancelSelected).delete().then(() =>{
                    db.collection("citas").doc(appointmentToCancelSelected).delete().then(() =>{
                        console.log("Cita cancelada exitosamente");
                    });
                });
            }
        });
    }
}

// function limitDatePicker(){
//     var dtToday = new Date();

//     var month = dtToday.getMonth() + 1;
//     var day = dtToday.getDate();
//     var year = dtToday.getFullYear();

//     if(month < 10)
//         month = '0' + month.toString();
//     if(day < 10)
//         day = '0' + day.toString();

//     var minDate = year + '-' + month + '-' + day;    
//     $('#search_date').attr('min', minDate);
//     $('#search_date').change(function () {
//         searchAvailableHours($('#date_picker').val());
//     });
// }