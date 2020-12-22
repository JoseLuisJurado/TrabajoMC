//Librerias

let stored_vars = ['x']
// Funciones
function escribe(html_path, element){
  fetch(html_path)
  .then(response => response.text())
  .then(data => {
  	element.innerHTML = data
  });
}


function init(){
  const contenido_basico = '\\assets\\contenido_basico.html';
  escribe(contenido_basico, contenido);
}

function adjust_vars(parametro){
  const texto = `<div class="row p-2">
     <label class="col-md" for="${parametro}">${parametro}</label>
     <input class="col-sm-4" style="text-align:right" type="text" onchange="update_var(this)" id="${parametro}" value="">
     </div>`;
}

function update_var(element){
  values.set(this.id, this.value);
}



const contenido = document.getElementById('content');

init();

$(function() {
    $("#vars").change(function() {
      console.log(this);
    });
});

