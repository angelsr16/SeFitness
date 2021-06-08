function hideAndShow(idPanel1, idPanel2, animationSpeed){
    panel1 = $(idPanel1);
    panel2 = $(idPanel2);
    panel2.show();
    panel1.hide();
}
function showDetails(id, show){
    idExercise = "#" + id.trim();
    idBtnShow = idExercise + "_view";
    idBtnHide = idExercise + "_hide";

    // console.log(idExercise);
    // console.log(idBtnShow);
    // console.log(idBtnHide);
    // console.log(show);
    
    if(show){
        $(idBtnShow).hide();
        $(idBtnHide).show();

        $(idExercise).show("fast");
    }else{
        $(idBtnShow).show();
        $(idBtnHide).hide();
        
        $(idExercise).hide("fast");
    }
}

function removeComponent(id){
    idComponent = "#" + id;
    $(idComponent).hide("fast", function(){
        $(idComponent).remove();
    });
}

function showModal(id, active){
    if(active){
        $(id).modal("show");
    }else{
        $(id).modal("hide");
    }
}

function showComponent(id){
    $(id).show();
}

function getFormValue(id){
    return $(id).val();
}

function displayAlertPanel(msg){
    $("#alerts_panel")
    .empty()
    .append(
        "<div class='alert alert-warning alert-dismissible show mt-3' role='alert' style='display: none;'> " +
            "<strong>¡Error! </strong>" + msg +
            " <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>" +
        "</div>"
    );
    $(".alert").show();
}

function removeAlertPanel(){
    $("#alerts_panel").empty();
}

function displayFirebaseAuthError(errorCode, errorPanelId){
    errorMessage = "";
    switch(errorCode){
        case "auth/email-already-exists":
            errorMessage = "El correo ya está en uso por otro usuario";
            break;
        case "auth/invalid-password":
            errorMessage = "La contraseña debe contener al menos 6 caracteres";
            break;
        case "auth/wrong-password":
            errorMessage = "Contraseña incorrecta/correo incorrecto";
            break;
        case "auth/email-already-in-use":
            errorMessage = "El correo ya está en uso por otro usuario";
            break;
        case "auth/weak-password":
            errorMessage = "La contraseña debe contener al menos 6 caracteres";
            break;
        default:
            errorMessage = "Hubo un error con el inicio de sesión, intente de nuevo";
    }
    $(errorPanelId)
    .empty()
    .append(
        "<div class='alert alert-warning alert-dismissible show mt-3' role='alert' style='display: none;'> " +
            "<strong>Error </strong>" + errorMessage +
            " <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>" +
        "</div>"
    );
    $(".alert").show();
    console.log(errorMessage + ":" + errorCode);
}

function getDaysFromDaySelector(chkBoxDays){
    selectedDays = "";
    chkBoxDays.forEach(function(day){
        if($(day)[0].checked) selectedDays += "1";
        else selectedDays += "0";
    });
    return selectedDays;
}

function getDaySelector(cont){
    return [`#mon-${cont}`,`#tue-${cont}`,`#wed-${cont}`,`#thu-${cont}`,`#fri-${cont}`,`#sat-${cont}`,`#sun-${cont}`];
}

function isDaySelectorValid(chkBoxDays){
    isValid = false;
    chkBoxDays.forEach(function(day){
        if(!$(day)[0].checked){
            
        }
        console.log("wep");
    });
    console.log("no valido");
    return false
}

function getFormattedDate(milliseconds){
    const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
      ]
    date = new Date(milliseconds);
    const monthIndex = date.getMonth()
    const monthName = months[monthIndex]
    console.log(date.getDate()); 
    sDay = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate().toString();
    return `${sDay}/${monthName}/${date.getFullYear()}`;
}

function getIndexFromArray(array, arrayElement){
    index = -1;
    cont = 0;
    array.forEach(element =>{
        if(arrayElement == element) index = cont;
        cont++;
    });
    return index;
}