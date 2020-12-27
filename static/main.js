//Librerias

//Parámetros
const contenido = document.getElementById("content");
const param_content = document.getElementById("parametros")
var stored_equation = [];
var expr0;
var expr1;
var iterations = 0;
var final_iterations = 0;
var values = {}
var go_button = document.body;
var points = [];
var params = [];
var orbit;
// Funciones


function init() {
  //const contenido_basico = "\\templates\\contenido_basico.html";
  //print_mode(contenido_basico, contenido);
  grab_vars()
  plot();
  plot2();
  go_button.addEventListener("click", function () {
    grab_vars();
    plot();
    plot2();
  });
}

function grab_vars() {
  try {
    stored_equation = document.getElementById("eq").value.split(",");
    expr0 = math.parse(stored_equation[0])
    expr1 = math.parse(stored_equation[1])
    iterations = parseFloat(document.getElementById("n").value);
    final_iterations = parseFloat(document.getElementById("m").value);
    values[String("x")] = parseFloat(document.getElementById("x0").value);
    values["y"] = parseFloat(document.getElementById("y0").value);
    go_button = document.getElementById("go_button");
  } catch (err) { }
}

function orbita2dF() {
  // take expresion and compile in mathjs
  var x0 = values["x"]
  var y0 = values["y"]
  var xs = [];
  var ys = [];

  var itMap = Object.assign({}, values);

  itMap["x"] = x0;
  itMap["y"] = y0;

  var n = iterations
  var m = final_iterations

  if (m < 0) {
    alert("Las iteraciones finales (m) no pueden ser menores negativas.")
  } else if (m == 0) {

    for (let i = 0; i < n + 1; i++) {
      x_cal = expr0.evaluate(itMap);
      y_cal = expr1.evaluate(itMap);
      itMap["x"] = x_cal;
      itMap["y"] = y_cal;
      xs.push(x_cal);
      ys.push(y_cal);

    }
  } else if (m > 0) {

    m += n;

    for (let i = 0; i < m + 1; i++) {

      x_cal = expr0.evaluate(itMap);
      y_cal = expr1.evaluate(itMap);
      itMap["x"] = x_cal;
      itMap["y"] = y_cal;

      if (i > n) {
        xs.push(x_cal);
        ys.push(y_cal);
      }
    }
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

  const layout = {
    title: 'Representación de orbita'
  };

  const data = [trace1];
  Plotly.newPlot("plot", data, layout);
}

function plot2() {

  // render the plot using plotly
  const trace1 = {
    x: orbit[0],
    y: orbit[1],
    mode: 'markers',
    type: "scatter",
    marker: { size: 10 }
  };

  const layout = {
    title: 'Representación de los atractores'
  };

  const data = [trace1];
  Plotly.newPlot("plot2", data, layout);

}

