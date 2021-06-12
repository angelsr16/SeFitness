$(document).ready(function(){

    var db = firebase.firestore();
    //Create exercises list from firebase
    db.collection(`exercises`).onSnapshot((querySnapshot) => {
        $(`#exercises_firebase_list`).empty();
        querySnapshot.forEach((doc) => {
            createVisualExcercise(doc);
        });
    });

    var routineForm = $("#routine_form")[0];
    var newExerciseForm = $("#exercise_form")[0];


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

    btnCreateExercise = $("#btnCreateExercise");
    btnCreateExercise.click(function(e){
        var isValid = newExerciseForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            createFirebaseExercise(db);
            //hideAndShow('#create_exercise', '#create_routine_panel')
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
            //Delete exercise
            db.collection("exercises").doc(currentExerciseSelected).delete().then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
        }
    });

});

currentExerciseSelected = -1;

function removeExerciseFromFirebase(exerciseId){
    console.log(exerciseId);
    currentExerciseSelected = exerciseId;
    showModal("#confirmRemoveExerciseModal", true);
}


let exercisesIndexAdded = [];
let exercisesAdded = [];
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
        $(".alert").show();
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

    database.collection("exercises").add({
        Nombre: exerciseName,
        Tipo: exerciseType,
        Repeticiones: exerciseRepetitions,
        Series: exerciseSeries,
        Intensidad: exerciseIntensity,
        Categoria: exerciseCategory
    })
    .then((docRef) =>{
        console.error("Ejercicio registrado correctamente: ", docRef);
        hideAndShow('#create_exercise', '#create_routine_panel');
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

function createVisualExcercise(exercise){
    $(`#exercises_firebase_list`).append(`<div class='row list-row' id='${exercise.id}'> ` +
            `<h6 class='col-md-8 btn-select' id='${exercise.id}_select' >${exercise.data().Nombre}</h6>` +
            `<div class='col-md-1 btn-select' onclick='hideAndShow('#create_routine_panel','#edit_exercise')'>` +
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
}