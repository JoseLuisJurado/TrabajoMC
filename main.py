from flask import Flask, render_template, make_response, request, jsonify
from sympy import *
import sympy
import os
import sys
import json

if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    app = Flask(__name__, template_folder=template_folder)
else:
    app = Flask(__name__)

print("Se inicia la aplicación")

x, y = symbols('x y')
n = None
m = None
x0 = None
xn = None
y0 = None
yn = None
k = None
f = None
g = None


@app.route('/')
def init():
    '''
    La siguiente función se encarga de iniciar la página.
    Carga una serie de valores por defecto que introduce en la página en su inicio.
    '''
    eq = "a - x^2 + b*y, x".split(',')
    A = [[1, 1], [1, 2]]
    f = sympify(eq[0].replace('^', '**'))
    g = sympify(eq[1].replace('^', '**'))
    n = 100
    m = 0
    x0 = 0.
    y0 = 1.
    size = 10
    prec = 3
    fixed_points = nonlinsolve([Eq(f.subs({'a':0,'b':0}), x), Eq(g.subs({'a':0,'b':0}), y)], (x, y))
    stability = [[(-1,-1), "punto de silla"],[(0,0), "punto atractivo"]]
    j = [[-2*x, 0], [1, 0]]
    eigen_values = [[2,0],[0,0]]
    n_l = [0,1]
    exp_l = ['zoo',0]
    return render_template("index.html", f=f, g=g, A=A, n=n, m=m, x0=x0, y0=y0, size = size, prec = prec, fixed_points=fixed_points, stability=stability, j=j, eigen_values=eigen_values, n_l = n_l, exp_l=exp_l)


@app.route('/output')
def update_funcs():
    '''
    Se detalla paso por paso el funcionamiento de la siguiente función
    
    '''
    try:
        if request.args.get('type') == "eq":
            # Almacenamos las funciones, que parseamos el las siguientes lineas
            eq = request.args.get('input').split(',')
            values = json.loads(request.args.get('values'))
            print(f"Valores pasados: {values}")
            values.pop("x")
            values.pop("y")
            f = sympify(eq[0].replace('^', '**')).subs(values)
            g = sympify(eq[1].replace('^', '**')).subs(values)
        else:
            matrix = request.args.get('input')
            print(matrix)
            print(type(matrix))
            matrix = Matrix(sympify(request.args.get('input')))
            print(f"Matrix: {matrix}")
            matrix = matrix*(Matrix([x, y]))
            f = matrix.tolist()[0][0]
            g = matrix.tolist()[1][0]

        # Recogemos las variables necesarias para la ejecución del estudio del mapa
        n = int(request.args.get("n"))
        m = int(request.args.get("m"))
        print(f"n: {n}, m: {m}")
        x0 = float(request.args.get("x0"))
        y0 = float(request.args.get("y0"))
        print(f"x0: {x0}, y0: {y0}")
        print(f"funciones:{f,g}")

        # Calculamos los puntos fijos resolviendo las ecuaciones del mapa
        fixed_points = nonlinsolve([Eq(f, x), Eq(g, y)], (x, y))
        print(f"puntos fijos:{fixed_points}")

        # #Calculamos la estabilidad de los puntos fijos mediante la funcion estabilidad
        stability = points_stability(f, g, fixed_points)
        print(f"estabilidad: {stability}")

        j = [[simplify(i) for i in x] for x in Matrix([f, g]).jacobian(Matrix([x, y])).tolist()]
        print(f"Jacobiana:{j}")

        f_eigen_values = list(Matrix([f, g]).jacobian(
            Matrix([x, y])).eigenvals().keys())

        eigen_values = [list(simplify(f.subs({x:p[0], y:p[1]})) for f in f_eigen_values) for p in fixed_points]
        
        print(f"Autovalores: {eigen_values}")
        n_l = lyapunov_n(f, g, x0, y0)
        print(f"Exponentes de Lyapunov {n_l}")
        exp_l = list(map(lambda x: ln(x), n_l))
        print(f"Exponentes de Lyapunov {exp_l}")

        return render_template('output.html', fixed_points=fixed_points, stability=stability, j=j, eigen_values=eigen_values, n_l = n_l, exp_l=exp_l)
    except Exception as ex:
        template = "Ocurrio una excepción del tipo: {0}. Los detalles son:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        print(message)
        print(f''' Es probable que sea debido a la version instalada de Sympy.
                  Actualmente tiene instalada la versión: {sympy.__version__}.
                  Intente instalar la ultima version usando: pip install sympy --upgrade''')


def points_stability(f, g, fixed_points):
    stability = list()
    Df = Matrix([f, g]).jacobian(Matrix([x, y]))

    for point in fixed_points:
        eigen_values = list(
            Df.subs({x: point[0], y: point[1]}).eigenvals().keys())

        if im(eigen_values[0]) != 0:
            a = re(eigen_values[0])
            b = im(eigen_values[0])
            r = sqrt((a**2) + (b**2))
            if abs(r) < 1:
                stability.append((point, "punto atractivo."))
            else:
                stability.append((point, "punto repulsivo."))
        
        elif len(set(eigen_values)) == 2 and im(eigen_values[1]) != 0:
            a = re(eigen_values[1])
            b = im(eigen_values[1])
            r = sqrt((a**2) + (b**2))
            if abs(r) < 1:
                stability.append((point, "punto atractivo."))
            else:
                stability.append((point, "punto repulsivo.")) 

        else:
            if len(set(eigen_values)) == 2:
                if (abs(eigen_values[0]) < 1 and 1 < abs(eigen_values[1])) or (abs(eigen_values[1]) < 1 and 1 < abs(eigen_values[0])):
                    stability.append((point, "punto de silla."))
                if 0 < abs(eigen_values[0]) < 1 and 0 < abs(eigen_values[1]) < 1:
                    stability.append((point, "punto atractivo."))
                if 1 < abs(eigen_values[0]) and 1 < abs(eigen_values[1]):
                    stability.append((point, "punto repulsivo."))

            if len(set(eigen_values)) == 1:
                if abs(eigen_values[0]) < 1:
                    stability.append((point, "punto atractivo."))
                else:
                    stability.append((point, "punto repulsivo."))

    return stability


def lyapunov_n(f, g, x0, y0):
    vec = Matrix([f, g])
    fx = vec.diff(x)
    fy = vec.diff(y)
    A = Matrix([[fx, fy]])
    A_t = A.transpose()
    return list(map(lambda x: sqrt(x), list((A*A_t).subs({x: x0, y: y0}).eigenvals().keys())))


if __name__ == '__main__':
    app.run(host="localhost", port=5500)
