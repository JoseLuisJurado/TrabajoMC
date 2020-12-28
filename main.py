from flask import Flask, render_template, request
from sage.all import *
from sage.misc.reset import EXCLUDE
from sage.misc.parser import Parser
import os

file_dir = __file__[:-7]
if file_dir:
    os.chdir(file_dir)
else:
    file_dir = "./"

if os.path.exists("python3.stackdump"):
    os.remove("python3.stackdump")
    
app = Flask(__name__, template_folder="templates")
app.config["CACHE_TYPE"] = "null"
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
    exp_l = ["",""]
    return render_template("index.html", f=f, g=g, n=n, m=m, x0=x0, y0=y0, exponentes_lyapunov = exp_l)

# @app.route('/', methods=["POST"])
# def update_funcs():
#     reset_cache()
#     funciones = request.form['eq'].split(',')
#     f = p.parse(funciones[0])
#     g = p.parse(funciones[1])
#     vec = vector([f,g])
#     n = int(request.form['n'])
#     m = int(request.form['m'])
#     x0 = float(request.form['x0'])
#     y0 = float(request.form['y0'])

#     print(f"funciones:{f,g}")

#     puntos_fijos = solve([f==x, g==y], x, y, solution_dict=True)
#     puntos_fijos = convierte_puntos_fijos(puntos_fijos)
#     print(get_memory_usage())
#     gc.collect()
#     print(f"puntos fijos:{puntos_fijos}")

#     estabilidad_puntos = points_stability(f, g, puntos_fijos)
#     print(f"estabilidad: {estabilidad_puntos}")

#     j = jacobian([f,g], [x,y])
#     print(f"Jacobiana:{j}")

#     exp_l = lyapunov_exp(f,g, x0, y0)
#     print(f"Exponentes de Lyapunov {exp_l}")

#     return render_template('index.html', f=f, g=g, n=n, m=m, x0=x0, y0=y0, exponentes_lyapunov = exp_l, puntos_fijos=puntos_fijos, estabilidad_puntos=estabilidad_puntos, j = j)


@app.route('/output')
def update_funcs():
    reset_cache()
    funciones = request.args.get('eq').split(',')
    f = p.parse(funciones[0])
    g = p.parse(funciones[1])
    vec = vector([f,g])
    n = int(request.args.get("n"))
    m = int(request.args.get("m"))
    print(f"n: {n}, m: {m}")
    x0 = float(request.args.get("x0"))
    y0 = float(request.args.get("y0"))
    print(f"x0: {x0}, y0: {y0}")
    print(f"funciones:{f,g}")

    puntos_fijos = solve([f==x, g==y], x, y, solution_dict=True)
    puntos_fijos = convierte_puntos_fijos(puntos_fijos)
    print(f"puntos fijos:{puntos_fijos}")

    estabilidad_puntos = points_stability(f, g, puntos_fijos)
    print(f"estabilidad: {estabilidad_puntos}")

    j = jacobian([f,g], [x,y])
    print(f"Jacobiana:{j}")

    exp_l = lyapunov_exp(f,g, x0, y0)
    print(f"Exponentes de Lyapunov {exp_l}")

    return render_template('output.html', puntos_fijos=puntos_fijos, estabilidad_puntos=estabilidad_puntos, j = j, exponentes_lyapunov = exp_l)

def convierte_puntos_fijos(puntos_fijos):
    res = list()
    for puntos in puntos_fijos:
        puntos[x] = puntos[x].n()
        puntos[y] = puntos[y].n()
        res.append(puntos)
    return res

def points_stability(f,g, puntos_fijos):
    estabilidad_puntos = list()
    vec = vector([f,g])
    fx=vec.diff(x)
    fy=vec.diff(y)
    Df=matrix([fx, fy]).transpose()

    for point in puntos_fijos:
        autovalores=Df(x=point[x],y=point[y]).eigenvalues()
        if autovalores[0].imag() != 0:
            a = autovalores[0].real()
            b = autovalores[0].imag()
            r = sqrt((a**2) + (b**2))
            if abs(r) < 1:
                estabilidad_puntos.append((point, "punto atractivo."))
            else:
                estabilidad_puntos.append((point, "punto repulsivo."))
        else:
            if len(set(autovalores)) == 2:
                if 0 < abs(autovalores[0]) and abs(autovalores[1])<1:
                    estabilidad_puntos.append((point, "punto atractivo."))
                if 1 < abs(autovalores[0]) and 1 < abs(autovalores[1]):
                    estabilidad_puntos.append((point, "punto repulsivo."))
                if abs(autovalores[0]) < 1 and 1 < abs(autovalores[1]):
                    estabilidad_puntos.append((point, "punto de silla."))
            if len(set(autovalores)) == 1:
                if abs(autovalores[0]) < 1:
                    estabilidad_puntos.append((point, "punto atractivo."))
                else:
                    estabilidad_puntos.append((point, "punto repulsivo."))
    return estabilidad_puntos


def lyapunov_exp(f,g,x0,y0):
    vec = vector([f,g])
    fx = vec.diff(x)
    fy = vec.diff(y)
    A = matrix([fx,fy])
    A_t = A.transpose()
    return (A*A_t)(x=x0,y=y0).eigenvalues()

def reset_cache():
    EXCLUDE.add('request')
    EXCLUDE.add('p')
    EXCLUDE.add('convierte_puntos_fijos')
    EXCLUDE.add('points_stability')
    EXCLUDE.add('lyapunov_exp')
    EXCLUDE.add('render_template')
    EXCLUDE.add('EXCLUDE')
    EXCLUDE.add('reset_cache')
    EXCLUDE.add('gc')
    reset()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port = 5500)
