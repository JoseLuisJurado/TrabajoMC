
//No se porque no funca esto
const contenido = document.getElementById('content')

const contenido_basico =  `<div class="container-fluid">

<div class="p-3">

  <div id="input_data" class="row justify-content-between container p-3">

    <div class="row col-7 p-2">
      <label class="" for="vars">Variables</label>
      <input type="text" id="vars" value="x" placeholder="Introduce las variables (separadas por coma)">

    </div>

    <div class="row col-7 p-2">
      <label for="eq">Introduce la ecuación</label>
      <input text="text" id="eq" value="x" />
    </div>

    <div class="justify-content-end mt-3">
      <input class="btn btn-primary my-3" id="go_button" type="submit" value="Go!" />
    </div>
  </div>

</div>

<div class="row min-vh-80 flex-column flex-md-row mt-5 container-xl">

  <main class="col px-0 flex-grow-1">
    <div class="" style="color:red;">grafica_atractor</div>
  </main>

  <aside class="col-12 col-md-5 col-xl-2  bg-light p-2">
    
    <div>
      Puntos fijos
    </div>
    <div class="mt-3">
      Estabilidad
    </div>
    <div class="mt-3">
      datos de Lyapunov etc
    </div>

  </aside>

</div>

</div>
`;
function pp(){
    const equation = document.getElementById('eq').value;
    const expr = math.compile(equation);
}

function init(){
    contenido.innerHTML = contenido_basico;
}

init()