import sys
print(sys.executable)

from vpython import *

scene.background = color.white

# Crear cubos en línea
for i in range(5):
    box(pos=vector(i*1.2, 0, 0),
        size=vector(1,1,1),
        color=color.blue)

# Texto
label(pos=vector(2,2,0),
      text="Gira la escena 👀",
      height=20,
      color=color.black)
