from flask import Flask, render_template, request
from sage.all import *
from sage.misc.parser import Parser
import os

file_dir = __file__[:-7]
if file_dir:
    os.chdir(file_dir)
else:
    file_dir = "./"
app = Flask(__name__, template_folder="templates")
print("Se inicia la aplicación")

p = Parser(make_var = var)
n = None 
m = None 
x_max = None
x_min = None
y_max = None
y_min = None
x0 = None
y0 = None
f = None
g = None

@app.route('/')
def init():
    return render_template("index.html")

@app.route('/', methods=["POST"])
def load_params():
    funciones = request.form['eq'].split(',')
    f = p.parse(funciones[0])
    g = p.parse(funciones[1])
    n = request.form["n"]
    m = int(request.form["m"])
    x_max = int(request.form["x-max"])
    x_min = int(request.form["x-min"])
    y_max = int(request.form["y-max"])
    y_min = int(request.form["y-min"])
    x0 = float(request.form["x0"])
    y0 = float(request.form["y0"])
    print(f,g)
    print(f"n: {n}, m: {m}, x-max: {x_max}, x_min: {x_min}, y_max: {y_max}, y_min: {y_min}, x_0: {x0}, y_0: {y0}")
    puntos_fijos = solve([f==x, g==y], x, y, solution_dict=True)
    estabilidad_punts = points_stability(f, g)
    return render_template('index.html', puntos_fijos=puntos_fijos)

def points_stability(f, g):
    estabilidad_puntos = list()
    print(vector([f,g]))
    return estabilidad_puntos


if __name__ == '__main__':
    app.run(host="0.0.0.0", port = 5500)
