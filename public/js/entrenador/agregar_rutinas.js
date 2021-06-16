$(document).ready(function(){

    //Create exercises list from firebase
    db.collection(`exercises`).onSnapshot((querySnapshot) => {
        $(`#exercises_firebase_list`).empty();
        querySnapshot.forEach((doc) => {
            createVisualExcercise(doc);
        });
    });

    var routineForm = $("#routine_form")[0];
    var newExerciseForm = $("#exercise_form")[0];
    var editExerciseForm = $("#exercise_form_edit")[0];
    var editRoutineForm = $("#routine_edit_form")[0];

    btnEditExercise = $("#btnEditExercise");
    btnEditExercise.click(function(e){
        var isValid = editExerciseForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            editExercise();
        }
        editExerciseForm.classList.add('was-validated');
    });


    btnCreateRoutine = $("#btnCreateRoutine");
    btnCreateRoutine.click(function(e){
        var isValid = routineForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            createRoutine(db);
        }
        routineForm.classList.add('was-validated');
    });

    btnEditRoutine = $("#btnEditRoutine");
    btnEditRoutine.click(function(e){
        var isValid = editRoutineForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            editFirebaseRoutine();
        }
        editRoutineForm.classList.add('was-validated');
    });

    btnCreateExercise = $("#btnCreateExercise");
    btnCreateExercise.click(function(e){
        var isValid = newExerciseForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            createFirebaseExercise(db);
        }
        newExerciseForm.classList.add('was-validated');
    });

    btnCancelRemove = $("#btn_cancel_remove");
    btnCancelRemove.click(function(e){
        currentExerciseSelected = -1;
    });

    btnRemoveExercise = $("#btn_remove_exercise");
    btnRemoveExercise.click(function(e){
        if(currentExerciseSelected != -1){
            db.collection("exercises").doc(currentExerciseSelected).get().then((exercise) =>{
                if(exercise.data().Rutinas.length == 0){
                    console.log("Eliminar");
                    // Delete exercise
                    db.collection("exercises").doc(currentExerciseSelected).delete().then(() => {
                        console.log("Document successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing document: ", error);
                    });
                }else{
                    displayAlertPanel("Este ejercicio está asignado a una rutina, no puede ser eliminado");
                    console.log("This exercise is used by a routine");
                }
            })
        }
    });

});

currentEditRoutineSelected = -1;

currentExerciseSelected = -1;
currentExerciseForEditSelected = -1;

function removeExerciseFromFirebase(exerciseId){
    console.log(exerciseId);
    currentExerciseSelected = exerciseId;
    showModal("#confirmRemoveExerciseModal", true);
}


let exercisesIndexAdded = [];
let exercisesAdded = [];

let originalExercisesFromRoutine = [];

function removeExercise(id){
    removeComponent(id);
    indexToRemove = exercisesIndexAdded.indexOf(id);
    exercisesIndexAdded.splice(indexToRemove,1);
    exercisesAdded.splice(indexToRemove, 1);
}

function addExercise(exerciseObject){
    if(!exercisesIndexAdded.includes(exerciseObject.id+"_preview")){
        exercisesIndexAdded.push(exerciseObject.id+"_preview");
        exercisesAdded.push(exerciseObject.id);
        $(`#new_exercises_list`)
        .append(`<div class='row list-row' id=`+exerciseObject.id+`_preview> <h6 class='col-md-10 btn-select'>${exerciseObject.data().Nombre}</h6> <div class='col-md-2 btn-select' onclick='removeExercise(\``+exerciseObject.id+`_preview\`)'><i class='bi bi-x-square-fill'></i></div></div>`);
    }
}

function createRoutine(database){
    if(exercisesAdded.length > 0){
        createFirebaseRoutine(database);
    }else{
        displayAlertPanel("¡Agrega por lo menos un ejercicio a la rutina!")
    }
}

function createFirebaseRoutine(database){
    routineName = getFormValue("#form_name");
    routineType = $("#form_type option:selected").text();
    console.log(routineName);
    database.collection("routines").add({
        Nombre: routineName,
        Tipo: routineType,
        Ejercicios: exercisesAdded,
        Usuarios: []
    })
    .then((docRef) => {
        
        console.log("Rutina agregada correctamente");
        exercisesAdded.forEach(exerciseId => {
            db.collection("exercises").doc(exerciseId).update({
                Rutinas: firebase.firestore.FieldValue.arrayUnion(docRef.id)
            })
        });
        location.reload();
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

function createFirebaseExercise(database){
    exerciseName = getFormValue("#form_name_exercise");
    exerciseType = $("#form_type_exercise option:selected").text();
    exerciseRepetitions = getFormValue("#form_repetitions");
    exerciseSeries = getFormValue("#form_series");
    exerciseIntensity = getFormValue("#form_intensity");
    exerciseCategory = getFormValue("#form_category");

    isDataValid = true;

    if(exerciseRepetitions == 0){
        isDataValid = false;
        displayAlertPanel("No puede haber 0 repeticiones en una rutina");
    }else if(exerciseSeries == 0){
        isDataValid = false;
        displayAlertPanel("No puede haber 0 series en una rutina");
    }else{
        removeAlertPanel();
    }

    console.log("Válido: " + isDataValid);
    if(isDataValid){
        database.collection("exercises").add({
            Nombre: exerciseName,
            Tipo: exerciseType,
            Repeticiones: exerciseRepetitions,
            Series: exerciseSeries,
            Intensidad: exerciseIntensity,
            Categoria: exerciseCategory,
            Rutinas: []
        })
        .then((docRef) =>{
            console.log("Ejercicio registrado correctamente: ", docRef);
            hideAndShow('#create_exercise', '#create_routine_panel');
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    }

}

function createVisualExcercise(exercise){
    $(`#exercises_firebase_list`).append(`<div class='row list-row' id='${exercise.id}'> ` +
            `<h6 class='col-md-8 btn-select' id='${exercise.id}_select' >${exercise.data().Nombre}</h6>` +
            `<div class='col-md-1 btn-select' id='${exercise.id}_edit'>` +
                `<i class='bi bi-pencil-fill'></i>` +
            `</div>` +
            `<div class='col-md-1 btn-select'  onclick='removeExerciseFromFirebase(\``+exercise.id+`\`)'>` +
                `<i class='bi bi-x-square-fill'></i>` +
            `</div>` +
            `<div class='col-md-1 btn-select' onclick='showDetails(\``+exercise.id+`_details\`, true)' id='${exercise.id}_details_view'>` +
                `<i class='bi bi-eye-fill'></i>` +
            `</div>` +
            `<div class='col btn-select' onclick='showDetails(\``+exercise.id+`_details\`, false)' id='${exercise.id}_details_hide' style='display: none;'>` +
                `<i class='bi bi-eye-slash-fill'></i>` +
            `</div>` +
            `<div id='${exercise.id}_details' style='display:none;'>` +
                `<div class='row mt-2'>` +
                    `<div><p>Tipo de ejercicio: ${exercise.data().Tipo} </p></div>` +
                    `<div><p>Repeticiones: ${exercise.data().Repeticiones}</p></div>` +
                    `<div><p>Series: ${exercise.data().Series}</p></div>` +
                    `<div><p>Intensidad: ${exercise.data().Intensidad}</p></div>` +
                    `<div><p>Categoría: ${exercise.data().Categoria}</p></div>` +
                `</div>` +
            `</div>` +
        `</div>`);
        $(`#${exercise.id}_select`).on('click', function(){
            addExercise(exercise);
        });
        $(`#${exercise.id}_edit`).on('click', function(){
            editFirebaseExercise(exercise);
        });
}

function createVisualExerciseForEditRoutine(exercise){
    $(`#exercises_firebase_list_edit`).append(`<div class='row list-row' id='${exercise.id}'> ` +
            `<h6 class='col-md-10 btn-select' id='${exercise.id}_select' >${exercise.data().Nombre}</h6>` +
            
            `<div id='${exercise.id}_details'>` +
                `<div class='row mt-2'>` +
                    `<div><p>Tipo de ejercicio: ${exercise.data().Tipo} </p></div>` +
                    `<div><p>Repeticiones: ${exercise.data().Repeticiones}</p></div>` +
                    `<div><p>Series: ${exercise.data().Series}</p></div>` +
                    `<div><p>Intensidad: ${exercise.data().Intensidad}</p></div>` +
                    `<div><p>Categoría: ${exercise.data().Categoria}</p></div>` +
                `</div>` +
            `</div>` +
        `</div>`);
        $(`#${exercise.id}_select`).on('click', function(){
            addExercise(exercise);
        });
}

function editFirebaseExercise(exercise){
    hideAndShow('#create_routine_panel','#edit_exercise');
    $("#edit_nombre_ejercicio").empty().append(exercise.data().Nombre);

    $("#form_name_exercise_edit").val(exercise.data().Nombre);
    $("#form_type_exercise_edit").val(exercise.data().Tipo);
    $("#form_repetitions_edit").val(exercise.data().Repeticiones);
    $("#form_series_edit").val(exercise.data().Series);
    $("#form_intensity_edit").val(exercise.data().Intensidad);
    $("#form_category_edit").val(exercise.data().Categoria);
    currentExerciseForEditSelected = exercise.id;
}

function editExercise(){
    exerciseName = getFormValue("#form_name_exercise_edit");
    exerciseType = $("#form_type_exercise_edit option:selected").text();
    exerciseRepetitions = getFormValue("#form_repetitions_edit");
    exerciseSeries = getFormValue("#form_series_edit");
    exerciseIntensity = getFormValue("#form_intensity_edit");
    exerciseCategory = getFormValue("#form_category_edit");
    db.collection("exercises").doc(currentExerciseForEditSelected).update({
        Nombre: exerciseName,
        Tipo: exerciseType,
        Repeticiones: exerciseRepetitions,
        Series: exerciseSeries,
        Intensidad: exerciseIntensity,
        Categoria: exerciseCategory
    })
    .then(() => {
        console.log("Document successfully updated!");
        hideAndShow('#edit_exercise', '#create_routine_panel');
    })
    .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function editRoutineSelect(routine){
    if(routine.data().Usuarios.length != 0){
        displayAlertPanel("Esta rutina está asignada a un cliente, no puede ser modificada");
    }else{
        currentEditRoutineSelected = routine.id
        hideAndShow('#routines_list', '#edit_routine');
        $("#form_name_edit").val(routine.data().Nombre);
        $("#form_type_edit").val(routine.data().Tipo);

        //Create exercises list from firebase
        db.collection(`exercises`).onSnapshot((querySnapshot) => {
            $(`#exercises_firebase_list_edit`).empty();
            querySnapshot.forEach((doc) => {
                createVisualExerciseForEditRoutine(doc);
            });
        });
        
        exercisesIndexAdded = [];
        exercisesAdded = [];
        $(`#new_exercises_list`).empty();
        originalExercisesFromRoutine = routine.data().Ejercicios;
        // console.log(originalExercisesFromRoutine);
        routine.data().Ejercicios.forEach((exerciseId) =>{
            db.collection("exercises").doc(exerciseId).get().then((firebaseExercise) => {
                if(firebaseExercise.exists){
                    addExercise(firebaseExercise);
                }
            });
        });
    }
}

function editFirebaseRoutine(){
    if(exercisesAdded.length > 0){
        exercisesToUntieFromRoutine = originalExercisesFromRoutine.filter(n => !exercisesAdded.includes(n));
        console.log(exercisesToUntieFromRoutine + " " + currentEditRoutineSelected);
        exercisesToUntieFromRoutine.forEach((exerciseId) =>{
            db.collection("exercises").doc(exerciseId).update({
                Rutinas: firebase.firestore.FieldValue.arrayRemove(currentEditRoutineSelected)
            })
            .then(() => {
                console.log("Document successfully updated!");
            })
            .catch((error) => {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });
        });

        routineName = getFormValue("#form_name_edit");
        routineType = $("#form_type_edit option:selected").text();
        db.collection("routines").doc(currentEditRoutineSelected).update({
            Nombre: routineName,
            Tipo: routineType,
            Ejercicios: exercisesAdded
        })
        .then(() => {
            
            console.log("Rutina editada correctamente");
            exercisesAdded.forEach(exerciseId => {
                db.collection("exercises").doc(exerciseId).update({
                    Rutinas: firebase.firestore.FieldValue.arrayUnion(currentEditRoutineSelected)
                })
            });
            location.reload();
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
    }else{
        displayAlertPanel("¡Agrega por lo menos un ejercicio a la rutina!")
    }
}