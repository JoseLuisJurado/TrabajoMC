//Librerias

//Parámetros
const contenido = document.getElementById("content");
var stored_vars = [];
var stored_equation = "";
var iterations = 0;
var final_iterations = 0;
var x_min = 0;
var x_max = 10;
var y_min = 0;
var y_max = 10;
var x0 = 2;
var go_button = document.body;

// Funciones

function print_mode(html_path, element) {
  fetch(html_path)
    .then((response) => response.text())
    .then((data) => {
      element.innerHTML = data;
    });
}

function init() {
  const contenido_basico = "\\assets\\contenido_basico.html";
  print_mode(contenido_basico, contenido)
  setTimeout(grab_vars, 100);
  setTimeout(plot, 100);
  go_button.addEventListener('click', function(){
    grab_vars();
    plot();
   } );
}

function grab_vars() {
  stored_equation = document.getElementById("eq").value;
  stored_vars = document.getElementById("vars").value.split(",");
  iterations = document.getElementById("n").value;
  final_iterations = document.getElementById("m").value;
  x_min = parseFloat(document.getElementById("x-min").value);
  x_max = parseFloat(document.getElementById("x-max").value);
  y_min = parseFloat(document.getElementById("y-min").value);
  y_max = parseFloat(document.getElementById("y-max").value);
  x0 = document.getElementById("x0").value;
  go_button = document.getElementById('go_button');
}

// function plot_attractor(){
  
// }

function orbita(){
  const expr = math.compile(stored_equation)

  // evaluate the expression repeatedly for different values of x
  fn = expr.evaluate({x:x0})
  var xs = [x0]
  var ys = [fn];
  var n;
  if (final_iterations != 0){
    console.log("la hemos liado")
    n = final_iterations-iterations

  }
  else{
    n = iterations
  }
  for (let i = 0; i < n; i++) {
    xs.push(fn)
    fn = expr.evaluate({x:fn})
    ys.push(fn)
  }
  return [xs,ys]
}
function plot() {
    // compile the expression once
    const expr = math.compile(stored_equation)

    // evaluate the expression repeatedly for different values of x
    xs = orbita()[0]
    ys = orbita()[1]

    // render the plot using plotly
    const trace1 = {
      x: xs,
      y: ys,
      type: 'scatter'
    }
    const data = [trace1]
    Plotly.newPlot('plot', data)

}

init()
