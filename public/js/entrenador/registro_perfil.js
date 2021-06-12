$(document).ready(function(){

    userList = $("#user_list");
    registroPerfil = $("#profile_register");

    registroPerfil.hide();

    registrateBtn = $("#registrate_btn");
    registrateBtn.click(function(){
        registroPerfil.slideUp("fast", function(){
            userList.slideDown("slow");
        });
    });

    user1 = $("#user_1");
    user1.click(function(){
        userList.slideUp("fast", function(){
            registroPerfil.slideDown("slow");
        });
    });

});
