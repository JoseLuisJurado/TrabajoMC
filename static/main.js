//Librerias

//Parámetros
const contenido = document.getElementById("content");
const param_content = document.getElementById("parametros")
var stored_equation = [];
var expr0;
var expr1;
var iterations = 0;
var final_iterations = 0;
var x_min = 0;
var x_max = 10;
var y_min = 0;
var y_max = 10;
var values = {}
var go_button = document.body;
var points = [];
var params = [];
// Funciones


function init() {
  //const contenido_basico = "\\templates\\contenido_basico.html";
  //print_mode(contenido_basico, contenido);
  grab_vars()
  plot();
  go_button.addEventListener("click", function () {
    grab_vars();
    plot();
    points_stability();
  });
}

function grab_vars() {
  try {
    stored_equation = document.getElementById("eq").value.split(",");
    expr0 = math.parse(stored_equation[0])
    expr1 = math.parse(stored_equation[1])
    iterations = document.getElementById("n").value;
    final_iterations = document.getElementById("m").value;
    x_min = parseFloat(document.getElementById("x-min").value);
    x_max = parseFloat(document.getElementById("x-max").value);
    y_min = parseFloat(document.getElementById("y-min").value);
    y_max = parseFloat(document.getElementById("y-max").value);
    values[String("x")] = document.getElementById("x0").value;
    values["y"] = document.getElementById("y0").value;
    go_button = document.getElementById("go_button");
  } catch (err) {}
}


function points_stability(){
  var jacobian_matrix = math.matrix([[math.derivative(stored_equation[0],'x'),math.derivative(stored_equation[0],'y')],[math.derivative(stored_equation[1],'x'),math.derivative(stored_equation[1],'y')]]);
  var eigen_values = math.evaluate(jacobian_matrix,{x:3,y:5});
  console.log(eigen_values.toString());
}

function orbita2dF() {
  // take expresion and compile in mathjs
  var x0 = values["x"]
  var y0 = values["y"]
  var xs = [x0];
  var ys = [y0];

  var itMap = Object.assign({}, values);
  var x_cal = expr0.evaluate(values);
  var y_cal = expr1.evaluate(values);

  itMap["x"] = x_cal;xs.push(x_cal);
  itMap["y"] = y_cal;ys.push(y_cal);

  if (final_iterations != 0){
    n = final_iterations-iterations;
  } else{
    n = iterations;
  }
  for (let i = 0; i < n; i++) {

    x_cal = expr0.evaluate(itMap);
    y_cal = expr1.evaluate(itMap);
    itMap["x"] = x_cal;xs.push(x_cal);
    itMap["y"] = y_cal;ys.push(y_cal);
    
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
