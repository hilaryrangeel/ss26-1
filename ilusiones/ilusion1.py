from tkinter import Tk, Canvas
ventana = Tk()
ventana.title("Ilusiones ópticas")
canvas = Canvas(ventana, width=400, height=400)
j,l,k = 210,410,610
for i in range(10,200,10):
    # Horizontales
    canvas.create_line(10,i,200,i, fill="black", width=1)

    # Verticales
    canvas.create_line(j+i,10,j+i,200, fill="black", width=1)



# Esta linea siempre va al final
canvas.pack()
ventana.mainloop()