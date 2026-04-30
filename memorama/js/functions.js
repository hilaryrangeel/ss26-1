const params = new URLSearchParams(window.location.search);
let set = params.get("set");
var esperando = false;
var imagenTemporal;
var intentos = 0;
var numPares = 0;

if(!set){
    set = "set1";
}

var deck = ["1.png", "1.png", "2.png", "2.png", 
    "3.png", "3.png", "4.png", "4.png", 
    "5.png", "5.png", "6.png", "6.png", 
    "7.png", "7.png", "8.png", "8.png", 
    "9.png", "9.png", "10.png", "10.png", 
    "11.png", "11.png", "12.png", "12.png", 
    "13.png", "13.png", "14.png", "14.png",
    "15.png", "15.png", "16.png", "16.png"];
    
    //Cerrojo
    var bloqueado = false; 

function cambiarImagen(imagen, indice) { 
    //Si el sistema está bloqueado o se hace click en la misma carta que ya está abierta, no hará nada
    if (bloqueado || imagen === imagenTemporal) return;

    imagen.src = "./" + set + "/" + deck[indice];
    imagen.removeAttribute("onclick");

    if (!esperando) {
        // Primer click de la pareja
        imagenTemporal = imagen;
        esperando = true;
    } 
    else {
        //Contador de intentos
        intentos++;
        document.getElementById("intentos").innerHTML = intentos;
        // Segundo click de la pareja
        esperando = false; 

        if (imagenTemporal.src == imagen.src) {
            // Son iguales
            borrar(imagenTemporal, imagen);
            // Limpiamos la referencia
            imagenTemporal = null; 
            paresEncontrados++;
            document.getElementById("pares").innerHTML = paresEncontrados;
        } 
        else {
            // No son iguales: ACTIVAMOS BLOQUEO
            bloqueado = true; 
            
            setTimeout(function() { 
                regresar(imagenTemporal, imagen);
                // Limpiamos la referencia
                imagenTemporal = null; 
                // LIBERAMOS BLOQUEO después del segundo click
                bloqueado = false;    
            }, 1000);
        }
    }
}

function regresar(img1, img2){
    img1.src = "./" + set + "/back.png";
    img2.src = "./" + set + "/back.png";
    // Volvemos a agregar el evento onclick
    img1.setAttribute("onclick", `cambiarImagen(this, ${img1.id});`);
    img2.setAttribute("onclick", `cambiarImagen(this, ${img2.id});`);
}

function shuffleDeck() {
    deck.sort(() => Math.random() - 0.5);
    const cartas = document.querySelectorAll("img");
    cartas.forEach(carta => {
        carta.src = "./" + set + "/back.png";
    });

    document.body.style.backgroundImage = "url('./" + set + "/wallpaper.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.getElementById("help").innerHTML = deck.join("<br>");
}

function borrar(img1,img2){
    img1.style.visibility = "hidden";
    img2.style.visibility = "hidden";
    img1.removeAttribute("onclick");
    img2.removeAttribute("onclick");
}

function reiniciarJuego() {
    // 1. Resetear variables lógicas
    esperando = false;
    imagenTemporal = null;
    bloqueado = false;
    contadorIntentos = 0;
    paresEncontrados = 0;

    // 2. Actualizar el labels en la esquina superior izquierda
    document.getElementById("intentos").innerHTML = "0";
    document.getElementById("pares").innerHTML = "0";

    // 3. Restaurar las cartas (visibilidad y clicks)
    const cartas = document.querySelectorAll("img");
    cartas.forEach(carta => {
        carta.style.visibility = "visible";
        // Importante: que el ID coincida con la posición en el deck
        carta.setAttribute("onclick", `cambiarImagen(this, ${carta.id});`);
    });

    // 4. Mezclar de nuevo
    shuffleDeck();
}