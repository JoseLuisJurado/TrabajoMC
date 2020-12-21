//Librerias

const contenido = document.getElementById('content');
const contenido_basico = '\\assets\\contenido_basico.html'

function escribe(html_path, element){
  fetch(html_path)
  .then(response => response.text())
  .then(data => {
  	element.innerHTML = data
  });
}


function init(){
  escribe(contenido_basico, contenido);
}

init();
