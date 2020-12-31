from flask import Flask, render_template, make_response, request
from sympy import *
import os
init_printing()

file_dir = __file__[:-7]
if file_dir:
    os.chdir(file_dir)
else:
    file_dir = "./"

'''
Las siguientes dos lineas borran el archivo 'python3.stackdump' generado
durante la ejecución de código cuando se produce un core_dump
'''
if os.path.exists("python3.stackdump"):
    os.remove("python3.stackdump")
    
app = Flask(__name__, template_folder="templates")

print("Se inicia la aplicación")


x,y = symbols('x y')
n = None 
m = None 
x0 = None
y0 = None
f = None
g = None

@app.route('/')
def init():
    '''
    La siguiente función se encarga de iniciar la página.
    Carga una serie de valores por defecto que introduce en la página en su inicio.
    '''
    eq = "1.2-x^2+0.4*y,x".split(',')
    f = sympify(eq[0].replace('^', '**'))
    g = sympify(eq[1].replace('^', '**'))
    n = 100
    m = 0
    x0 = 0.
    y0 = 1.
    exp_l = ["",""]
    return render_template("index.html", f=f, g=g, n=n, m=m, x0=x0, y0=y0, exp_l = exp_l)

'''
La siguiente función se encarga de realizar los cambios de igual forma que la dispuesta con el botón Go!, salvo que lo hace 
mediante una peticion HTTP-POST, recibiendo de vuelta el HTML con los datos procesados,en lugar de un GET con estos mismos datos
'''
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
    '''
    Se detalla paso por paso el funcionamiento de la siguiente función
    '''
    if request.args.get('type') == "eq":
        eq = request.args.get('input').split(',') # Almacenamos las funciones, que parseamos el las siguientes lineas
        f = sympify(eq[0].replace('^', '**'))
        g = sympify(eq[1].replace('^', '**'))
    else:
        matrix = Matrix(sympify(request.args.get('input')))
        print(f"Matrix: {matrix}")
        matrix = matrix*(Matrix([x,y]))
        f = matrix.tolist()[0][0]
        g = matrix.tolist()[1][0]


    
    #Recogemos las variables necesarias para la ejecución del estudio del mapa
    n = int(request.args.get("n"))
    m = int(request.args.get("m"))
    print(f"n: {n}, m: {m}")
    x0 = float(request.args.get("x0"))
    y0 = float(request.args.get("y0"))
    print(f"x0: {x0}, y0: {y0}")
    print(f"funciones:{f,g}")

    #Calculamos los puntos fijos resolviendo las ecuaciones del mapa
    fixed_points = nonlinsolve([Eq(f,x), Eq(g,y)], (x,y))
    #fixed_points = to_numerical(fixed_points)
    print(f"puntos fijos:{fixed_points}")

    # #Calculamos la estabilidad de los puntos fijos mediante la funcion estabilidad
    stability = points_stability(f, g, fixed_points)
    print(f"estabilidad: {stability}")

    j = Matrix([f,g]).jacobian(Matrix([x,y])).tolist()
    print(f"Jacobiana:{j}")

    exp_l = lyapunov_exp(f,g, x0, y0)
    print(f"Exponentes de Lyapunov {exp_l}")

    return render_template('output.html', fixed_points=fixed_points, stability = stability, j = j, exp_l = exp_l)


def points_stability(f,g, fixed_points):
    stability = list()
    vec = Matrix([f,g])
    fx = vec.diff(x)
    fy = vec.diff(y)
    Df = Matrix([[fx,fy]]).transpose()

    for point in fixed_points:
        eigen_values=list(Df.subs({x:point[0],y:point[1]}).eigenvals().keys())
        if im(eigen_values[0]) != 0:
            a = re(eigen_values[0])
            b = im(eigen_values[0])
            r = sqrt((a**2) + (b**2))
            if abs(r) < 1:
                stability.append((point, "punto atractivo."))
            else:
                stability.append((point, "punto repulsivo."))
        else:
            if len(set(eigen_values)) == 2:
                if 0 < abs(eigen_values[0]) and abs(eigen_values[1])<1:
                    stability.append((point, "punto atractivo."))
                if 1 < abs(eigen_values[0]) and 1 < abs(eigen_values[1]):
                    stability.append((point, "punto repulsivo."))
                if abs(eigen_values[0]) < 1 and 1 < abs(eigen_values[1]):
                    stability.append((point, "punto de silla."))
            if len(set(eigen_values)) == 1:
                if abs(eigen_values[0]) < 1:
                    stability.append((point, "punto atractivo."))
                else:
                    stability.append((point, "punto repulsivo."))
    return stability


def lyapunov_exp(f,g,x0,y0):
    vec = Matrix([f,g])
    fx = vec.diff(x)
    fy = vec.diff(y)
    A = Matrix([[fx,fy]])
    A_t = A.transpose()
    return list((A*A_t).subs({x:x0,y:y0}).eigenvals().keys())


if __name__ == '__main__':
    app.run(host="0.0.0.0", port = 5500)
