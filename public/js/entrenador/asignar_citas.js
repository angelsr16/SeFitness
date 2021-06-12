$(document).ready(function(){
    limitDatePicker();
    createVisualUsers();

    var appointmentForm = $("#appointment_form")[0];

    $("#assign_appointment").click(function(e){
        var isValid = appointmentForm.checkValidity();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }else{
            assignAppointment(userSelected);
        }
        appointmentForm.classList.add('was-validated');
    });

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

availableHours = [
    '08:00','08:30',
    '09:00','09:30',
    '10:00','10:30',
    '11:00','11:30',
    '12:00','12:30',
    '13:00','13:30',
    '14:00','14:30',
    '15:00','15:30',
    '16:00','16:30',
    '17:00','17:30',
    '18:00','18:30',
];

var userSelected = -1;

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

function createVisualUsers(){
    db.collection(`users`).where(`role`, `==`, `Cliente`).onSnapshot((querySnapshot) => {
        $(`#users_firebase_list`).empty();
        querySnapshot.forEach((user) => {
            $(`#users_firebase_list`)
                .append(
                    `<div class='row list-row text-center' id='${user.id}' onclick="addUser(\`${user.id}\`,\`${user.data().name}\`)"> ` +
                        `<div class='col-md-10'>` +
                            `<div class='row' >` +
                                `<h6 class='col-md-6'>${user.data().name}</h6>` +
                                `<h6 class='col-md-6'>${user.data().email}</h6>` +
                            `</div>` +
                        `</div>` +
                        `<div class='col-md-2'>` +
                            `<div class='row'>` +
                                // `<h6 class='pointer col' onclick='viewUserProgress(\`${user.id}\`, \`${user.data().name}\`)'>Avances</h6> ` +
                                // `<span class='bi bi-exclamation-lg col' style='color:red; visibility: ${requestIsVisible}; '></span> ` +
                            `</div>` +
                        `</div>` +
                    `</div>`
                );
                userComponentIds.push(user.id);
                userComponentNames.push(user.data().name);  
        });
        
    });
}

function addUser(userId, userName){
    userSelected = userId;
    $('#selected_user').empty();
    $(`#selected_user`).append(
        `<div id="selected_user">
            <div class="row list-row border-top border-dark" id="${userId}_preview">
                <h6 class="col-md-10 btn-select" id="food_1_select">${userName}</h6>
            </div>
        </div>`);
}

function assignAppointment(userId){
    if(userId === -1){
        displayAlertPanel("Elija primero el usuario al que asignará su cita");
    }else{
        //Create firebase appointment 
        removeAlertPanel();
        selectedDate = $("#date_picker").val();
        selectedTime = $("#time_picker option:selected").text();

        fixedDate = selectedDate.concat(" "+selectedTime);
        newDate = new Date(fixedDate);
        db.collection("citas").add({
            fechaInMillis: newDate.getTime(),
            fecha: selectedDate,
            hora: selectedTime,
            usuario: userId,
            estado: "Pendiente"
        })
        .then((docRef) =>{
            db.collection("fechas").doc(selectedDate).set({
                horasOcupadas: firebase.firestore.FieldValue.arrayUnion(selectedTime)
            },{merge:true});
            db.collection("users").doc(userSelected).collection("citas").add({
                citaRef: docRef.id,
                fechaInMillis: newDate.getTime(),
                fecha: selectedDate,
                hora: selectedTime,
                estado: "Pendiente",
                especialista: "Entrenador"
            });
            location.reload();
        })
        .catch((error) =>{

        });
    }
}

function limitDatePicker(){
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();

    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();

    var minDate = year + '-' + month + '-' + day;    
    $('#date_picker').attr('min', minDate);
    $('#date_picker').change(function () {
        searchAvailableHours($('#date_picker').val());
    });
    $('#date_picker').val(year + '-' + month + '-' + day);
    searchAvailableHours($('#date_picker').val());
}

function searchAvailableHours(selectedDate){
    db.collection("fechas").doc(selectedDate).get().then((doc) =>{
        if(doc.exists){
            console.log(doc.data().horasOcupadas);
            cont = 0;
            doc.data().horasOcupadas.forEach(hora => {
                if(availableHours.includes(hora)){
                    indexToRemove = getIndexFromArray(availableHours, hora);
                    if(indexToRemove != -1){
                        availableHours.splice(indexToRemove, 1);
                        console.log("Quitar: " + indexToRemove);
                    }
                }
                cont++;
            });
            populateAvailableHours();
        }else{
            console.log("Todas las horas disponibles");
            populateAvailableHours();
        }
    });
}

function populateAvailableHours(){
    $("#time_picker").empty();
    availableHours.forEach((hora) =>{
        $('#time_picker').append(`<option>${hora}</option>`)
    });
}