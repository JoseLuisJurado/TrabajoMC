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
var points = [];
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
  print_mode(contenido_basico, contenido);
  setTimeout(grab_vars, 100);
  setTimeout(plot, 100);
  go_button.addEventListener("click", function () {
    grab_vars();
    plot();
    fixed_points();
    points_stability();
  });
}

function grab_vars() {
  try {
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
    go_button = document.getElementById("go_button");
  } catch (err) {}
}

function fixed_points() {
  var x = nerdamer.solveEquations([
    stored_equation[0] + "=x",
    stored_equation[1] + "=y",
  ]);
  
  points = x;
  var string_points = `${x[0][0]}: ${x[0][1]}, ${x[1][0]}: ${x[1][1]} `

  document.getElementById("fixed_points").innerHTML = string_points;
}

function points_stability(){
  var jacobian_matrix = math.matrix([[math.derivative(stored_equation[0],'x'),math.derivative(stored_equation[0],'y')],[math.derivative(stored_equation[1],'x'),math.derivative(stored_equation[1],'y')]]);
  var eigen_values = math.evaluate(jacobian_matrix,{x:3,y:5});
  console.log(eigen_values.toString());
}

function orbita2dF() {
  // take expresion and compile in mathjs
  const expr0 = math.compile(stored_equation[0]);
  const expr1 = math.compile(stored_equation[1]);

  var xs = [x0];
  var ys = [y0];
  var x0_1 = 0;
  var y0_1 = 0;
  var x0_2 = x0;
  var y0_2 = y0;

  for (let i = 0; i < iterations; i++) {
    x0_1 = x0_2;
    y0_1 = y0_2;

    x0_2 = expr0.evaluate({ x: x0_1, y: y0_1 });
    y0_2 = expr1.evaluate({ x: x0_1, y: y0_1 });

    xs.push(x0_2);
    ys.push(y0_2);
  }

  return [xs, ys];
}

function plot() {
  // evaluate the expression repeatedly for different values of x and y
  orbit = orbita2dF();

  // render the plot using plotly
  const trace1 = {
    x: orbit[0],
    y: orbit[1],
    type: "scatter",
  };

  const data = [trace1];
  Plotly.newPlot("plot", data);
}
