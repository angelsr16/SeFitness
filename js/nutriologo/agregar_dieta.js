var foodCount = 0;

function addFood(){
    foodCount += 1;
    listSize = $("#new_food_list").children().length;
    listSize = foodCount;
    $("#new_food_list")
    .append("<div class='row list-row' id="+listSize+"> <h6 class='col-md-10 btn-select' id='"+listSize + "_select"+"'>Comida 1 <span class='text-danger'>(Tipo de comida)</span></h6> <div class='col-md-2 btn-select' onclick='removeComponent(\""+listSize+"\")'>Quitar</div></div>");
}