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

// Funciones
// function escribe(html_path, element) {
//   fetch(html_path)
//     .then((response) => response.text())
//     .then((data) => {
//       element.innerHTML = data;
//     });
// }

// function init() {
//   const contenido_basico = "\\assets\\contenido_basico.html";
//   escribe(contenido_basico, contenido);
// }

// function adjust_vars(parametro){
//   const texto = `<div class="row p-2">
//      <label class="col-md" for="${parametro}">${parametro}</label>
//      <input class="col-sm-4" style="text-align:right" type="text" onchange="update_var(this)" id="${parametro}" value="">
//      </div>`;
// }

// function update_var(element){
//   values.set(this.id, this.value);
// }

function grab_vars() {
  stored_equation = document.getElementById("eq").value;
  stored_vars = document.getElementById("vars").value.split(",");
  iterations = document.getElementById("n").value;
  final_iterations = document.getElementById("m").value;
  x_min = document.getElementById("x-min").value;
  x_max = document.getElementById("x-max").value;
  y_min = document.getElementById("y-min").value;
  y_max = document.getElementById("y-max").value;
}

// function plot_attractor(){
  
// }

// $(function() {
//     $("#vars").change(function() {
//       console.log(this);
//     });
// });


function draw() {
  try {
    // compile the expression once
    const expr = math.compile(stored_equation);

    // evaluate the expression repeatedly for different values of x
    const xValues = math.range(x_min, x_max, 0.5).toArray();
    const yValues = math.range(y_min, y_max, 0.5).toArray();
    const Values = xValues.map(function (x) {
      return yValues.map(function(y){
        return expr.evaluate({"x":x,"y":y});
      });
    });

    // render the plot using plotly
    const trace1 = {
      x: xValues,
      y: yValues,
      z: Values,
      type: "scatter",
    };
    
    const data = [trace1];
    Plotly.newPlot("plot", data);
  
  } catch (err) {
    console.error(err);
    alert(err);
  }
}