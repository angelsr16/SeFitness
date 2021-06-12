$(document).ready(function(){
    var db = firebase.firestore();
    //Create routines list from firebase
    db.collection(`routines`).onSnapshot((querySnapshot) => {
        $(`#routines_firebase_list`).empty();
        querySnapshot.forEach((routine) => {
            $(`#routines_firebase_list`)
            .append(
                `<div class='row list-row' id='${routine.id}'> ` +
                    `<h6 class='col-md-9' id='${routine.id}_select'>${routine.data().Nombre}</h6> ` +
                    `<div class='col-md-1 btn-select' onclick='hideAndShow(\`#routines_list_\`, \`#edit_routine_\`)'><i class='bi bi-pencil-fill'></i></div> ` +
                    `<div class='col-md-1 btn-select' onclick='removeRoutine(\``+routine.id+`\`)'><i class='bi bi-x-square-fill'></i></div> ` +
                    `<div class='col-md-1 btn-select' onclick='showDetails(\``+routine.id+`_exercises\`, true)' id='${routine.id}_exercises_view'><i class='bi bi-eye-fill'></i></div> ` +
                    `<div class='col btn-select' onclick='showDetails(\``+routine.id+`_exercises\`, false)' id='${routine.id}_exercises_hide' style='display: none;'><i class='bi bi-eye-slash-fill'></i></div> ` +

                    `<div id='${routine.id}_exercises' style='display:none;'>` +
                    `</div>` +
                `</div>`);
                //Create exercises list from the current routine
                if(routine.data().Ejercicios == null) return;
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

    btnRemoveRoutine = $("#btn_remove_routine");
    btnRemoveRoutine.click(function(e){
        if(currentRoutineSelected != -1){
            db.collection("routines").doc(currentRoutineSelected).get().then((routine) =>{
                if(routine.data().Usuarios.length == 0){
                    console.log("Eliminar");
                    //Delete routine
                    db.collection("routines").doc(currentRoutineSelected).delete().then(() => {
                        console.log("Document successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing document: ", error);
                    });
                }else{
                    displayAlertPanel("Esta rutina está asignada a un cliente, no puede ser eliminada");
                    console.log("This routine is used by a client");
                }
            })
            
        }
    });

    btnCancelRemove = $("#btn_cancel_remove");
    btnCancelRemove.click(function(e){
        currentRoutineSelected = -1;
    });
});

currentRoutineSelected = -1;

function removeRoutine(routineId){
    currentRoutineSelected = routineId;
    showModal("#exampleModal", true);
}

