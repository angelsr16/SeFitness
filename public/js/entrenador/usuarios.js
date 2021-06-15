$(document).ready(function(){
    
    createUsers("");

    $("#btn_assign_routine").click(function (e){
        if(isObservationsFormValid(e)){
            assignRoutine();
        }
    })

    $("#user_search_bar").on('input', function(){
        search = $("#user_search_bar").val();
        // // createUsers($("#user_search_bar").val());
        // console.log(search.toUpperCase());
        // console.log(user.data().name.toUpperCase());
        // console.log(user.data().name.toUpperCase().indexOf(nombre))
        // if(user.data().name.toUpperCase().indexOf(nombre.toUpperCase()) > -1){
        // }
        filterByName(search);
    });

});

userComponentIds = [];
userComponentNames = [];

function filterByName(search){
    for(var i = 0; i < userComponentIds.length; i++){
        if(userComponentNames[i].toUpperCase().indexOf(search.toUpperCase()) > -1){
            $("#" + userComponentIds[i]).show();
        }else{
            $("#" + userComponentIds[i]).hide();
        }
    }
}

function createUsers(nombre){
    $("#assigned_routine_section").show();
    $("#estatus_section").show();
    $("#motivos_section").hide();
    
    db.collection(`users`).where(`role`, `==`, `Cliente`).onSnapshot((querySnapshot) => {
        $(`#users_firebase_list`).empty();
        querySnapshot.forEach((user) => {
            
            routineElement = ``;
            console.log(user.data().rutinaAsignada);
            if(!user.data().rutinaAsignada){
                routineElement = `<h6 class='col text-danger pointer' onclick='selectUser(\`${user.id}\`, \`${user.data().name}\`, \`${user.data().ailments}\`)'>Asignar <i class='bi bi-pencil-fill'></i></h6>`
                createVisualUsers(user, routineElement, user.data().solicitudBaja);
            }else{
                db.collection(`users`).doc(user.id).collection(`routine`).doc(user.data().rutinaAsignada)
                .get()
                .then((routine) => {
                    routineElement = `<h6 class='col pointer' onclick='viewRoutineInfo(\`${user.id}\`, \`${user.data().name}\`,\`${routine.id}\`, \`${user.data().ailments}\`)'>${routine.data().Nombre} <i class='bi bi-eye-fill'></i></h6> `
                    createVisualUsers(user, routineElement, user.data().solicitudBaja);
                })
                .catch((error) => {
                    console.log(`Error getting documents: `, error);
                });
            } 
            
        });
    });
}

function createVisualUsers(user, routineElement, solicitudBaja){
    requestIsVisible = (solicitudBaja) ? 'visible' : 'hidden';
    //console.log(solicitudBaja);
    $(`#users_firebase_list`)
    .append(
        `<div class='row list-row text-center' id='${user.id}'> ` +
            `<div class='col-md-10'>` +
                `<div class='row' >` +
                    `<h6 class='col-md-4'>${user.data().name}</h6>` +
                    `<h6 class='col-md-3'>${user.data().email}</h6>` +
                    `<h6 class='col-md-3'>${user.data().status}</h6>` +
                    `<div class='col-md-2   '>` +
                        `<div class='row justify-content-center'>` +
                            routineElement +
                        `</div>` +
                    `</div>` +
                `</div>` +
            `</div>` +
            `<div class='col-md-2'>` +
                `<div class='row'>` +
                    `<h6 class='pointer col' onclick='viewUserProgress(\`${user.id}\`, \`${user.data().name}\`)'>Avances</h6> ` +
                    `<span class='bi bi-exclamation-lg col' style='color:red; visibility: ${requestIsVisible}; '></span> ` +
                `</div>` +
            `</div>` +
        `</div>`
    );
    userComponentIds.push(user.id);
    userComponentNames.push(user.data().name);
}

function showUnsubscribeRequests(){
    $("#btn_dar_baja").hide();
    $("#assigned_routine_section").hide();
    $("#estatus_section").hide();
    $("#motivos_section").show();
    db.collection("solicitudes").where("estado", "==", "Pendiente").get().then((querySnapshot) =>{
        $("#users_firebase_list").empty();
        querySnapshot.forEach((solicitud) => {
            db.collection("users").doc(solicitud.id).get().then((user) =>{
                if(user.exists){
                    $("#users_firebase_list").append(
                        `<div class='row list-row text-center' id='${user.id}'> ` +
                            `<div class='col-md-10'>` +
                                `<div class='row' >` +
                                    `<h6 class='col-md-4'>${user.data().name}</h6>` +
                                    `<h6 class='col-md-3'>${user.data().email}</h6>` +
                                    `<h6 class='col-md-5    '>${solicitud.data().motivo}</h6>` +
                                `</div>` +
                            `</div>` +
                            `<div class='col-md-2'>` +
                                `<button onclick="unsubscribe(\`${user.id}\`, \`${solicitud.id}\`)" type="button" name="button" class="btn my-btn-cancel">Dar de baja</button>` +
                            `</div>` +    
                        `</div>`);
                }
            });
        });
    });
}

function unsubscribe(userId, solicitudId){
    db.collection("users").doc(userId).update({
        status: "Baja",
        solicitudBaja: false
    })
    .then(() => {
        db.collection("solicitudes").doc(solicitudId).update({
            estado: "Baja"
        });
        $("#assigned_routine_section").show();
        $("#estatus_section").show();
        $("#motivos_section").hide();
        $("#btn_dar_baja").show();
        createUsers();
    })
    .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function viewUserProgress(userId, userName){
    hideAndShow(`#users_list`, `#user_progress`);
    $("#username_progress").empty().append("Usuario: " + userName);
    db.collection("users").doc(userId).collection("progress").orderBy("fecha").onSnapshot((querySnapshot) =>{
        $("#appointments_list").empty();
        querySnapshot.forEach((progress) =>{
            $("#appointments_list").append(
                `<div class="row list-row text-center" id="${progress.id}">
                    <div class="row">
                        <h6 class="col-md-6">${getFormattedDate(progress.data().fecha)}</h6>
                        <h6 class="col pointer" onclick="showDetails('${progress.id}_info', true)" id="${progress.id}_info_view"><i class="bi bi-eye-fill"></i></h6>
                        <h6 class="col pointer" onclick="showDetails('${progress.id}_info', false)" id="${progress.id}_info_hide" style="display: none;"><i class="bi bi-eye-slash-fill"></i></h6>
                    </div>
                    <div class="row text-start" style="margin-left:2em; display:none;" id="${progress.id}_info">
                        <p><b>Información general</b></p>
                        <p>Tipo de cuerpo: ${progress.data().tipoCuerpo} </p>
                        <p>Peso: ${progress.data().peso}</p>
                        <p>Estatura: ${progress.data().estatura}</p>
                        <p>I.M.C: ${progress.data().imc}</p>
                        <p><b>Medidas</b></p>
                        <p>Cuello: ${progress.data().cuello}</p>
                        <p>Brazo izquierdo: ${progress.data().brazoIzquierdo}</p>
                        <p>Brazo derecho: ${progress.data().brazoDerecho}</p>
                        <p>Antebrazo izquierdo: ${progress.data().antebrazoIzquierdo}</p>
                        <p>Antebrazo derecho: ${progress.data().antebrazoDerecho}</p>
                        <p>Torácico mesoesternal: ${progress.data().toracico}</p>
                        <p>Abdominal mínimo: ${progress.data().abdominalMinimo}</p>
                        <p>Periumbilical: ${progress.data().periumbilical}</p>
                        <p>Glúteo máximo: ${progress.data().gluteoMaximo}</p>
                        <p>Muslo izquierdo: ${progress.data().musloIzquierdo}</p>
                        <p>Muslo derecho: ${progress.data().musloDerecho}</p>
                        <p>Pierna máxima izquierda: ${progress.data().piernaIzquierda}</p>
                        <p>Pierna máxiam derecha: ${progress.data().piernaDerecha}</p>
                        <p>Observaciones: ${progress.data().observaciones}</p>
                    </div>
                </div>`
            );
        });
    });
}
