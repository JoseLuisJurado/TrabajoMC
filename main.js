//Librerias

//Parámetros
const contenido = document.getElementById("content");
var stored_vars = [];
var stored_equation = [];
var iterations = 0;
var final_iterations = 0;
var x_min = 0;
var x_max = 10;
var y_min = 0;
var y_max = 10;
var x0 = 2;
var y0 = 2;
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
  stored_equation = document.getElementById("eq").value.split(",");
  stored_vars = document.getElementById("vars").value.split(",");
  iterations = document.getElementById("n").value;
  final_iterations = document.getElementById("m").value;
  x_min = parseFloat(document.getElementById("x-min").value);
  x_max = parseFloat(document.getElementById("x-max").value);
  y_min = parseFloat(document.getElementById("y-min").value);
  y_max = parseFloat(document.getElementById("y-max").value);
  x0 = document.getElementById("x0").value;
  y0 = document.getElementById("y0").value;
  go_button = document.getElementById('go_button');
}

// function plot_attractor(){
  
// }

function orbita2dF(){

  // take expresion and compile in mathjs
  const expr0 = math.compile(stored_equation[0])
  const expr1 = math.compile(stored_equation[1])

  var xs = [x0];
  var ys = [y0];
  var x0_1 = 0;
  var y0_1 = 0;
  var x0_2 = x0;
  var y0_2 = y0;

  for (let i = 0; i < iterations; i++) {
      
      x0_1 = x0_2;
      y0_1 = y0_2;

      x0_2 = expr0.evaluate({x:x0_1,y:y0_1})
      y0_2 = expr1.evaluate({x:x0_1,y:y0_1})

      xs.push(x0_2)
      ys.push(y0_2)
    }
  
  return [xs,ys]
}

function plot() {

    // evaluate the expression repeatedly for different values of x and y
    orbit = orbita2dF();

    // render the plot using plotly
    const trace1 = {
      x: orbit[0],
      y: orbit[1],
      type: 'scatter'
    }

    const data = [trace1]
    Plotly.newPlot('plot', data)

}
