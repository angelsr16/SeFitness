userSelected = -1;
routineSelected = -1;
routineObject = {};
routines = new Map();
exercises = new Map();

$(document).ready(function(){

    usersList = $("#user_list");
    routinesList = $("#routines_list");
    observationsForm = $("#observations_form");
    routinesList.hide();
    observationsForm.hide();

    $("#btn_assign_routine").click(function (e){
        if(isObservationsFormValid(e)){
            assignRoutine();
        }
    });
});


function viewRoutineInfo(userId, userName, routineId, userailments){
    hideAndShow('#users_list', '#routine_info');
    $("#routine_info_edit")
    .empty()
    .append(
        `<button style="background-color: #424242; color: white;" type="button" name="button" class="btn" onclick='selectUser(\`${userId}\`, \`${userName}\`, \`${userailments}\`)'">
            Cambiar rutina
        </button>`);
    
    db.collection("users").doc(userId).collection("routine").doc(routineId).get()
        .then((routine) => {
            $("#routine_info_username").empty().append("Usuario: " + userName);
            $("#routine_info_name").empty().append(`${routine.data().Nombre}. Asignada el <strong class="text-danger">${getFormattedDate(routine.data().FechaAsignacion)}</strong>`);
            $("#routine_observations_user").empty().append(routine.data().Observaciones);
            //Create exercises list from the current routine
            if(routine.data().Ejercicios == null) return;
            $("#routine_info_exercises").empty();
            routine.data().Ejercicios.forEach((exerciseId) =>{
                db.collection("exercises").doc(exerciseId).get().then((firebaseExercise) => {
                    if(firebaseExercise.exists){
                        console.log("Exists: " + firebaseExercise)
                        $(`#routine_info_exercises`)
                        .append(
                            `<div class='row mt-2'>` +
                                `<h6>${firebaseExercise.data().Nombre} ` +
                                    `<span onclick='showDetails(\``+firebaseExercise.id+`_details\`, true)' id='${firebaseExercise.id}_details_view' style='font-weight: bolder;' class='pointer'>+</span> ` + 
                                    `<span onclick='showDetails(\``+firebaseExercise.id+`_details\`, false)' id='${firebaseExercise.id}_details_hide' style='display: none; font-weight: bolder;' class='pointer'>-</span> ` +
                                `</h6>` +
                                `<div class='row' id='${firebaseExercise.id}_details' style='display: none;'>` +
                                    `<div><p>Tipo de ejercicio: ${firebaseExercise.data().Tipo} </p></div>` +
                                    `<div><p>Repeticiones: ${firebaseExercise.data().Repeticiones}</p></div>` +
                                    `<div><p>Series: ${firebaseExercise.data().Series}</p></div>` +
                                    `<div><p>Intensidad: ${firebaseExercise.data().Intensidad}</p></div>` +
                                    `<div><p>Categoría: ${firebaseExercise.data().Categoria}</p></div>` +
                                `</div>` +
                            `</div>`);
                    }else{
                        console.log("No such document");
                    }
                });
            });
            console.log(routine.data());
        });
}

function selectUser(userId, userName, userailments){
    userSelected = userId;
    console.log("User selected: " + userSelected);
    $(`#user_to_asign`).empty().append(`Usuario: ` + userName);
    $("#user_to_asign_observations").empty().append("Usuario: " + userName);
    ailmentsComponent = userailments.replace(/(?:\r\n|\r|\n)/g, '<br>');
    $("#padecimientos_panel").empty().append(`${ailmentsComponent}`);
    //console.log(`Usuario seleccionado` + userSelected);
    hideAndShow('#users_list', '#routines_list');
    $("#routine_info").hide();
    createVisualRoutines();
}

function selectUserFromAppointment(userId){
    db.collection("users").doc(userId).get().then((user) =>{
        if(user.exists){
            userSelected = userId;
            console.log("User selected: " + userSelected);
            userName = user.data().name;
            userailments = user.data().ailments;
            $(`#user_to_asign`).empty().append(`Usuario: ` + userName);
            $("#user_to_asign_observations").empty().append("Usuario: " + userName);
            ailmentsComponent = userailments.replace(/(?:\r\n|\r|\n)/g, '<br>');
            $("#padecimientos_panel").empty().append(`${ailmentsComponent}`);
            //console.log(`Usuario seleccionado` + userSelected);
            hideAndShow('#profile_register', '#routines_list');
            createVisualRoutines();
        }
    });
}

function createVisualRoutines(){
    //Create routines list from firebase
    db.collection(`routines`).onSnapshot((querySnapshot) => {
        $(`#routines_firebase_list`).empty();
        querySnapshot.forEach((routine) => {
            routines.set(routine.id, {
                Nombre: routine.data().Nombre,
                Tipo: routine.data().Tipo,
                Ejercicios: [],
                Observaciones: ""
            });
            $(`#routines_firebase_list`)
            .append(
                `<div class='row list-row' id='${routine.id}'> ` +
                    `<h6 class='col-md-10 btn-select' id='${routine.id}_select' onclick='selectRoutine(\`${routine.id}\`, \`${routine.data().Nombre}\`)'>${routine.data().Nombre}</h6> ` +
                    `<div class='col-md-2 btn-select' onclick='showDetails(\`${routine.id}_exercises\`, true)' id='${routine.id}_exercises_view'><i class='bi bi-eye-fill'></i></div> ` +
                    `<div class='col-md-2 btn-select' onclick='showDetails(\`${routine.id}_exercises\`, false)' id='${routine.id}_exercises_hide' style='display: none;'><i class='bi bi-eye-slash-fill'></i></div> ` +
                    `<div id='${routine.id}_exercises' style='display:none;'> ` +
                    `</div> ` +
                `</div>`);
            //Create exercises list from the current routine
            if(routine.data().Ejercicios == null) return;
            routines.get(routine.id).Ejercicios = routine.data().Ejercicios;
            routine.data().Ejercicios.forEach((exerciseId) =>{
                db.collection("exercises").doc(exerciseId).get().then((firebaseExercise) => {
                    if(firebaseExercise.exists){
                        $(`#${routine.id}_exercises`)
                        .append(
                            `<div class='row mt-2'>` +
                                `<h6>${firebaseExercise.data().Nombre} ` +
                                    `<span onclick='showDetails(\``+firebaseExercise.id+`_details\`, true)' id='${firebaseExercise.id}_details_view' style='font-weight: bolder;' class='pointer'>+</span> ` + 
                                    `<span onclick='showDetails(\``+firebaseExercise.id+`_details\`, false)' id='${firebaseExercise.id}_details_hide' style='display: none; font-weight: bolder;' class='pointer'>-</span> ` +
                                `</h6>` +
                                `<div class='row' id='${firebaseExercise.id}_details' style='display: none;'>` +
                                    `<div><p>Tipo de ejercicio: ${firebaseExercise.data().Tipo} </p></div>` +
                                    `<div><p>Repeticiones: ${firebaseExercise.data().Repeticiones}</p></div>` +
                                    `<div><p>Series: ${firebaseExercise.data().Series}</p></div>` +
                                    `<div><p>Intensidad: ${firebaseExercise.data().Intensidad}</p></div>` +
                                    `<div><p>Categoría: ${firebaseExercise.data().Categoria}</p></div>` +
                                `</div>` +
                            `</div>`);
                    }else{
                        console.log("No such document");
                    }
                });
            });
        });
    });
}

function selectRoutine(routineId, routineName){
    routineSelected = routineId;
    exercisesFromSelectedRoutine = routines.get(routineSelected).Ejercicios
    $("#routine_name_selected").empty().append("Rutina: " + routineName);
    $("#exercises_list_preview").empty();
    cont = 0;
    console.log(exercisesFromSelectedRoutine);

    exercisesFromSelectedRoutine.forEach((exerciseId) => {
        db.collection("exercises").doc(exerciseId).get().then((firebaseExercise) =>{
            if(firebaseExercise.exists){
                $("#exercises_list_preview").append(
                    `<p>${firebaseExercise.data().Nombre}</p>` + 
                    `<div class="weekDays-selector">
                        <input type="checkbox" id="mon-${cont}" class="weekday" />
                        <label for="mon-${cont}"><strong>L</strong></label>
                        <input type="checkbox" id="tue-${cont}" class="weekday" />
                        <label for="tue-${cont}"><strong>M</strong></label>
                        <input type="checkbox" id="wed-${cont}" class="weekday" />
                        <label for="wed-${cont}"><strong>M</strong></label>
                        <input type="checkbox" id="thu-${cont}" class="weekday" />
                        <label for="thu-${cont}"><strong>J</strong></label>
                        <input type="checkbox" id="fri-${cont}" class="weekday" />
                        <label for="fri-${cont}"><strong>V</strong></label>
                        <input type="checkbox" id="sat-${cont}" class="weekday" />
                        <label for="sat-${cont}"><strong>S</strong></label>
                        <input type="checkbox" id="sun-${cont}" class="weekday" />
                        <label for="sun-${cont}"><strong>D</strong></label>
                    </div>`
                );
                cont++;
            }else{
                console.log("Error getting the document");
            }
        });
    });
    
    hideAndShow('#routines_list','#observations_form');
}

function assignRoutine(){
    if(userSelected != 1 && routineSelected != 1){
        isSelectedDaysValid = true;
        var selectedDays = [];
        cont = 0;
        routines.get(routineSelected).Ejercicios.forEach(function(exercise){
            days = getDaysFromDaySelector(getDaySelector(cont));
            if(days === "0000000"){
                isSelectedDaysValid = false;
                return;
            }
            console.log(days);
            selectedDays.push(days);
            cont++;
        });

        if(isSelectedDaysValid){
            console.log("Valido");
            console.log(Date.now());
            console.log(selectedDays);
            _observaciones = getFormValue("#observations");
            db.collection("users").doc(userSelected).collection("routine").doc(routineSelected).set({
                Nombre: routines.get(routineSelected).Nombre,
                Tipo: routines.get(routineSelected).Tipo,
                Observaciones: _observaciones,
                FechaAsignacion: Date.now(),
                Ejercicios: routines.get(routineSelected).Ejercicios,
                Dias: selectedDays
            })
            .then(() => {
                // Rutina asignada correctamente
                db.collection("users").doc(userSelected).get().then((user) =>{
                    if(user.exists){
                        rutinaAsignada = user.data().rutinaAsignada;
                        if(rutinaAsignada){
                            db.collection("routines").doc(rutinaAsignada).update({
                                Usuarios: firebase.firestore.FieldValue.arrayRemove(userSelected)
                            });
                        }
                        db.collection("users").doc(userSelected).update({
                            rutinaAsignada: routineSelected
                        });
                        db.collection("routines").doc(routineSelected).update({
                            Usuarios: firebase.firestore.FieldValue.arrayUnion(userSelected)
                        });
                    }
                });
                clearObservationsForm();
                hideAndShow('#observations_form', '#users_list');
                hideAndShow('#observations_form', '#dates_list');

            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
        }else{
            displayAlertPanel("Seleccione por lo menos 1 día");
            console.log("Seleccione un dia");
        }
    }else{
        //hideAndShow('#observations_form', '#users_list')
        console.log("Hubo un error");
    }
}

function isObservationsFormValid(e){
    var form = $("#assignment_form")[0];
    var isValid = form.checkValidity();
    if (!isValid) {
        e.preventDefault();
        e.stopPropagation();
    }
    form.classList.add('was-validated');
    return isValid;
}

function clearObservationsForm(){
    $("#assignment_form")[0].classList.remove('was-validated');
    $("#observations").val("");
}

function backForm(){
    hideAndShow('#observations_form','#routines_list');
    clearObservationsForm();
}


