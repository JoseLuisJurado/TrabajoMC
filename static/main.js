//Librerias

//Parámetros
const contenido = document.getElementById("content");
var matrix;
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
var cuenca;
var li_cache, over = false;
// Funciones


function init() {
  //const contenido_basico = "\\templates\\contenido_basico.html";
  //print_mode(contenido_basico, contenido);
  grab_vars();
  find_params();
  plot_orbita();
  plot_atractor();
  $("#eq_input").click(function () {
    $("#input_type").html(`<label for="eq" class="col-sm-4">Introduce la ecuación</label><input text="text" id="eq" class="px-2 h-50 mt-2" name="eq" onkeyup="find_params()" value="${stored_equation[0] + "," + stored_equation[1]}" placeholder="f1(x,y),f2(x,y)" />`)
    find_params();
  })
  $('#orb_tab').on('shown.bs.tab', function () {
    plot_orbita();
  })
  $('#att_tab').on('shown.bs.tab', function () {
    plot_atractor();
  })
  $('#cue_tab').on('shown.bs.tab', function () {
    plot_cuenca();
  })
  window.addEventListener('resize', function () {
    plot_atractor();
    plot_orbita();
    plot_cuenca();
  })
  $(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
  document.getElementById("eq").onkeyup(find_params())
  $("#go_button").click(function () {
    grab_vars();
    plot_orbita();
    plot_atractor();
    if ($("#eq_input").is(":checked")) {
      var _input = document.getElementById("eq").value;
      var _type = "eq"
    } else {
      var matrix = [[document.getElementById("m_00").value,
      document.getElementById("m_01").value],
      [document.getElementById("m_10").value,
      document.getElementById("m_11").value]]
      var _input = `[[${matrix[0][0]},${matrix[0][1]}],[${matrix[1][0]},${matrix[1][1]}]]`
      var _type = "matrix"
    }
    var _iterations = parseFloat(document.getElementById("n").value);
    var _final_iterations = parseFloat(document.getElementById("m").value);
    var _x0 = parseFloat(document.getElementById("x0").value);
    var _y0 = parseFloat(document.getElementById("y0").value);
    var _values = JSON.stringify(values)

    $.ajax({
      url: "/output",
      type: "get",
      data: { input: _input, values: _values, type: _type, n: _iterations, m: _final_iterations, x0: _x0, y0: _y0 },
      beforeSend: function () {
        $("#loading").show();
      },
      success: function (response) {
        $("#loading").hide();
        $("#output").html(response);
        $(document).ready(function () {
          $('[data-toggle="tooltip"]').tooltip();
        });
        plot_cuenca();
      },
      error: function (xhr) {
        $("#loading").hide();
        console.log("Hubo un error :/")
        console.log(xhr)
      }
    });
  });

}

function grab_vars() {
  try {
    try {
      stored_equation = document.getElementById("eq").value.split(",");
    } catch (err) {
      var matrix = [[document.getElementById("m_00").value,
      document.getElementById("m_01").value],
      [document.getElementById("m_10").value,
      document.getElementById("m_11").value]]
      stored_equation = `${matrix[0][0]}*x + ${matrix[0][1]}*y, ${matrix[1][0]}*x + ${matrix[1][1]}*y`.split(',')
    }
    expr0 = math.parse(stored_equation[0].replace('**', '^'))
    expr1 = math.parse(stored_equation[1].replace('**', '^'))
    iterations = parseFloat(document.getElementById("n").value);
    final_iterations = parseFloat(document.getElementById("m").value);
    values["x"] = parseFloat(document.getElementById("x0").value);
    values["y"] = parseFloat(document.getElementById("y0").value);
    go_button = document.getElementById("go_button");
  } catch (err) { }
}

function find_params() {
  let stock = "xXyY";
  var params = new Set();
  values = {}
  values["x"] = parseFloat(document.getElementById("x0").value);
  values["y"] = parseFloat(document.getElementById("y0").value);
  
  try {
    stored_equation = document.getElementById('eq').value.split(",");
    try {
      expr0 = math.parse(stored_equation[0].replace('**', '^'))
      expr0.traverse(function (node, path, parent) {
        
        switch (node.type) {
          case 'SymbolNode':
            if (!stock.includes(node.name) && path != 'fn') {
              params.add(node.name);
              values[node.name] = 0
            }
            break
          default:
            break;
        }
      })
    } catch (err) { }

    try {
      expr1 = math.parse(stored_equation[1].replace('**', '^'))
      expr1.traverse(function (node, path, parent) {
        switch (node.type) {
          case 'SymbolNode':
            if (!stock.includes(node.name) && path != 'fn') {
              params.add(node.name);
              values[node.name] = 0
            }
            break
          default:
            console.log(node.type);
            break;
        }
      })
    } catch (err) { }

    var params_html = ""
    params.forEach(function (param) {
      params_html += `<div class="row p-2">
                  <label class="col-md" for="${param}">${param}</label>
                  <input class="col-sm-4" style="text-align: right" type="number" onchange="values[this.id]=parseFloat(this.value)" id="${param}" name="${param}" value="0.0" />
                  </div>`
    })
    document.getElementById("params").innerHTML = params_html

  } catch (err) {
    document.getElementById("params").innerHTML = ""
  }

}
function orbita() {
  var xs = [parseFloat(x0.value)];
  var ys = [parseFloat(y0.value)];

  var itMap = Object.assign({}, values);

  var n = iterations
  var m = final_iterations

  if (m < 0) {
    alert("Las iteraciones finales (m) no pueden ser negativas.")
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


function atraido_por(x_inicial, y_inicial, raices, prec) {
  var res = -1;
  var itMap = Object.assign({}, values)
  itMap.x = x_inicial; itMap.y = y_inicial;
  for (let i = 0; i < iterations; i++) {
    raices.forEach(function (e) {
      if (math.norm(itMap.x - e[0], itMap.y - e[1]) < parseFloat(`1e-${prec}`)) {
        res = e;
        return res;
      }
    })
    x_cal = expr0.evaluate(itMap);
    y_cal = expr1.evaluate(itMap);
    itMap.x = x_cal;
    itMap.y = y_cal;
  }
  return res
}

function linspace(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + (step * i));
  }
  return arr;
}

function newton_rhapson(f, g, x_inicial, y_inicial, raices) {
  const x = math.parse('x');
  const y = math.parse('y');
  var itMap = Object.assign({}, values);
  itMap.x = x_inicial;
  itMap.y = y_inicial;
  var temp = math.matrix([[x_inicial], [y_inicial]])
  for (let i = 0; i < 100; i++) {
    var fxy = math.transpose(math.matrix([[f.evaluate(itMap)], [g.evaluate(itMap)]]))
    var Jf = math.matrix([[math.derivative(f, x).evaluate(itMap), math.derivative(f, y).evaluate(itMap)], [math.derivative(g, x).evaluate(itMap), math.derivative(g, y).evaluate(itMap)]])
    if (math.det(Jf) == 0) {
      return math.matrix([[0], [0]])
    } else {
      temp = math.transpose(math.subtract(math.transpose(temp), math.divide(fxy, Jf)))
    }
    raices.forEach(function (e) {
      if (math.norm(temp - e) < 1e3) {
        return e;
      }
    })
    itMap.x = temp.toArray()[0][0];
    itMap.y = temp.toArray()[1][0];
  }
  return -1;
}

function plot_orbita() {
  // evaluate the expression repeatedly for different values of x and y
  orbit = orbita();

  // render the plot using plotly
  const trace1 = {
    x: orbit[0],
    y: orbit[1],
    type: "scatter",
  };

  const layout = {
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    title: 'Representación de la órbita'
  };

  const data = [trace1];
  Plotly.newPlot("plot_orb", data, layout);
}

function plot_atractor() {

  // render the plot using plotly
  const trace1 = {
    x: orbit[0],
    y: orbit[1],
    mode: 'markers',
    type: "scatter",
    marker: { size: 10 }
  };

  const layout = {
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    title: 'Representación de los atractores'
  };

  const data = [trace1];
  Plotly.newPlot("plot_att", data, layout);

}


function plot_cuenca() {

  var raices = []

  const fp = document.getElementById("fixed_points")

  for (let i = 0; i < fp.children.length; i++) {
    var p = fp.children[i].children[0]
    var coordx = parseFloat(p.children[0].textContent.substring(2))
    var coordy = parseFloat(p.children[0].textContent.substring(2))
    raices.push([coordx, coordy])
  }
  var size = parseInt(document.getElementById('size').value)
  var z = new Array(size);
  var frontera = Math.max(Math.max.apply(null, orbit[0].map(Math.abs)), Math.max.apply(null, orbit[1].map(Math.abs)));
  var iniciales = linspace(-frontera, frontera, size)
  for (let i = 0; i < size; i++) {
    z[i] = new Array(size)
  }
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      var p = atraido_por(iniciales[i], iniciales[j], raices, prec)
      if (p == -1) {
        z[i][j] = -1
      } else {
        z[i][j] = raices.indexOf(p)
      }
    }
  }
  var data = [{
    x: iniciales,
    y: iniciales,
    z: z,
    type: 'contour'
  }
  ];

  Plotly.newPlot("plot_cue", data);

}
