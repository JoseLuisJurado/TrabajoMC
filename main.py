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
x0 = None
y0 = None
f = None
g = None

@app.route('/')
def init():
    funciones = "1.2-x^2+0.4*y,x".split(',')
    f = p.parse(funciones[0])
    g = p.parse(funciones[1])
    n = 100
    m = 0
    x0 = 0.
    y0 = 1.
    return render_template("index.html", f=f, g=g, n=n, m=m, x0=x0, y0=y0)

@app.route('/', methods=["POST"])
def load_params():
    funciones = request.form['eq'].split(',')
    f = p.parse(funciones[0])
    g = p.parse(funciones[1])
    vec = vector([f,g])
    n = int(request.form["n"])
    m = int(request.form["m"])
    x0 = float(request.form["x0"])
    y0 = float(request.form["y0"])
    print(f,g)
    puntos_fijos = solve([f==x, g==y], x, y, solution_dict=True)
    print(puntos_fijos)
    estabilidad_puntos = points_stability(f, g, puntos_fijos)
    j = jacobian([f,g], [x,y])
    exp_l = lyapunov_exp(f,g)
    return render_template('index.html', puntos_fijos=puntos_fijos, estabilidad_puntos=estabilidad_puntos, f=f, g=g, n=n, m=m, x0=x0, y0=y0, j = j, exponentes_lyapunov = exp_l)

def points_stability(f,g, puntos_fijos):
    estabilidad_puntos = list()
    vec = vector([f,g])
    fx=vec.diff(x)
    fy=vec.diff(y)
    Df=matrix([fx, fy]).transpose()

    for point in puntos_fijos:
        autovalores_p1=Df(x=point[x],y=point[y]).eigenvalues()
        if autovalores_p1[0] > 1 and autovalores_p1[1] > 1:
            estabilidad_puntos.append((point,"punto repulsivo."))
        elif (autovalores_p1[0] > 1 and autovalores_p1[1] < 1) or (autovalores_p1[0] < 1 and autovalores_p1[1] > 1):
            estabilidad_puntos.append((point,"punto de silla."))
        elif autovalores_p1[0] < 1 and autovalores_p1[1] < 1:
            estabilidad_puntos.append((point,"punto atractivo."))

    return estabilidad_puntos

def lyapunov_exp(f,g):
    vec = vector([f,g])
    fx = vec.diff(x)
    fy = vec.diff(y)
    A = matrix([fx,fy])
    A_t = A.transpose()
    return (A*A_t).eigenvalues()
    
if __name__ == '__main__':
    app.run(host="0.0.0.0", port = 5500)
