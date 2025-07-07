const grid = document.getElementById("cells");        //obtiene los ids del html para las celdas
const select = document.getElementById("dificultad-select"); // obtiene los ids para la selcción de díficultad
const iniciar = document.getElementById("iniciar-juego"); // obtineer las id de para la sección de iniciar juego

let tablero = [];   // matiz para el tablero
let juegoActivo = false;  // estado del juego
let puntaje = 0;    // puntaje
let numFilas = 0;   //num de filas
let numColumnas = 0;  // variable para el numero de columnas

iniciar.addEventListener("click", () => {   //protocolo listener de nombre iniciar, reacciona al click sobre el boton
  grid.innerHTML = "";    // incializa el grid
  tablero = [];           // asigna un valor al tablero
  puntaje = 0;            // inciializa un puntuaje
  actualizarPuntaje();    // hace actualizacion de el puntaje
  juegoActivo = true;     // cambia el estado del juego a activo
  mostrarRecord();        // llamado a la función que muestra el record
  const dificultad = select.value;  // declará una constatne que será la dificualtad, esto apaertir de la opción seleccionada
  if (dificultad === "easy") {      // bloque para la opcion fácil
    numFilas = 10;  // 10 filas [0-9]
    numColumnas = 10; // 10 columans [0-9]
  } else if (dificultad === "medium") {   // bloque para la opción media
    numFilas = 20;      // 20 filas [0-19]
    numColumnas = 40;   // 20 columans [0-19]
  } else if (dificultad === "hard") {     // bloque para la opción dificil
    numFilas = 30;      // 30 filas [0-29]
    numColumnas = 60;   //60 columnas [0-59]
  }
  const estilos = getComputedStyle(document.documentElement);     // obtención de los estilos calculados del html
  const anchoTablero = parseFloat(estilos.getPropertyValue('--ancho-tablero')); // obtención del valores de ancho del tablero en css
  const altoTablero = parseFloat(estilos.getPropertyValue('--alto-tablero'));   // obtención del vlaore del alto del tablero en el css

  const anchoCelda = anchoTablero / numColumnas; // calculo de ancho que tendrá cada celda
  const altoCelda = altoTablero / numFilas;       // calculo del alto que tendrá cada celda


  grid.style.gridTemplateColumns = `repeat(${numColumnas}, ${anchoCelda}px)`; // esto creara el numero de columnas con un ancho de ciertos pixrles
  grid.style.gridTemplateRows = `repeat(${numFilas}, ${altoCelda}px)`;        // esto creará el número de filas con un ancho de ciertos piceles


  iniciarJuego(); // se incia el juego
});


// funcion para inciar el juego
function iniciarJuego() {
  // Lógica del tablero
  for (let f = 0; f < numFilas; f++) {  // por cada fila se tendrá dentro lo siguiente
    const fila = [];                    // se tendra un arreglo que funcionara como pila
    for (let c = 0; c <  numColumnas; c++) {  // por cada columnad de cada fila se tendrá
      fila.push({          // estrucutra con los datos 
        esBomba: false, // bandera para saber si la celda tiene una bomba
        revelada: false,  // bandera para saber si la celda ya fue revelada
        bombasCerca: 0,   // en un radio de 3x3 pondra el número de bombas que se tiene
        banderin: false   // bandera que dirá si se ha marcado con banderin o no
      });
    }
    tablero.push(fila);   // cada fila contendrá sus columnas, posterioremte se agregara al tablero
  }

  // Creando celdas
  casillasTablero(numFilas, numColumnas);

  // Colocando las minas
  const totalCeldas = numFilas * numColumnas;   // obteniendo el número de celdas
  const minas = Math.floor(totalCeldas * 0.15); // asignando un 15% de las celdas como minas
  addMinas(minas);                              // llamando a la colocación de las minas

  //AgAsignando eventos
  for (let f = 0; f < numFilas; f++) {          // se recorrerán las filas
    for (let c = 0; c < numColumnas; c++) {     // se recorrerán las columans de las filas
      const div = document.getElementById(`cell-${f}-${c}`);    // busca las celdas del tablero

      // Click izquierdo
      div.addEventListener("click", () => {     // espera a que se de click izquierdo a una celda
        revelarCelda(f, c);                     // llama a la revelación de la celda
      });

      // Click derecho (banderín)
      div.addEventListener("contextmenu", (e) => {  // espera al que de click izquierdo a una celda
        e.preventDefault();                         // evita el menú del navegador  
        Banderin(f, c);                             // llama a la colocación de un banderin
      });
  }
  }
}

// función para la creacion de las casillas del tablero
function casillasTablero(numFilas, numColumnas) {     
  for (let f = 0; f < numFilas; f++) {            //  recorre las filas
    for (let c = 0; c < numColumnas; c++) {       //  recorre las columnas
      const cell = document.createElement("div"); //  crea un nuevo elemento div html
      cell.className = "cell";                    //  agina la celda a la clase celda para que le css le de ese estilo
      cell.id = `cell-${f}-${c}`;                 //  le asigna un id, en este caso su cordenada
      grid.appendChild(cell);                     //  inseta al contenedor principl del grid
    }
  }
}


// función para añadir las minas
function addMinas(numMinas) { 
  const colocadas = new Set();                          // crea un Set para evitar repetir una celda que ya tenga mina     

  while (colocadas.size < numMinas) {                   // bucle para que se coloquen minas hasta que se llegue al número de minas previmente calculadas
    const f = Math.floor(Math.random() * numFilas);     // obteniendo las filas
    const c = Math.floor(Math.random() * numColumnas);  // obteniendo las columnas
      
    if (!tablero[f][c].esBomba) {                       // si la celda aun no es una mina se hará
      tablero[f][c].esBomba = true;                     // cambio de estado
      colocadas.add(`${f}-${c}`);                       // se añade esa cordenada al set

      // Contador de bombas cercana
      for (let i = -1; i <= 1; i++)  {                  //    Estas dos lineas permiten recorrer                    
        for (let j = -1; j <= 1; j++) {                 //    en un area de 3x3, es decir las 8 al rededor
          const nf = f + i;                             // se ubica en filas
          const nc = c + j;                             // se ubica en cplimnas
          if (                                          // condicion para que no se cuente la misma celda en la que se dio click
            nf >= 0 &&                                  // verifica tambien que se cuente dentro del grid y el tablero
            nf < numFilas &&
            nc >= 0 &&
            nc < numColumnas &&
            !(i === 0 && j === 0)
          ) {
            tablero[nf][nc].bombasCerca++;              // añade al contador de bombas cerca de cada celda que hay una bomba más
          }
        }
      }
    }
  }
}

// función para revelar la celda
function revelarCelda(f, c) {
  
  const celda = tablero[f][c];  // se da un valor en arreglo para cada coordenad de la celda
  actualizarPuntaje();          // actualiza el puntaje
  if (celda.banderin) return;   // en caso de que haya un bandein no permitia acción alguna
  if (!juegoActivo) return;     // en caso de que no este activo el juego no permitirá acción alguna
  if (!celda || celda.revelada) return; // si la celda ya fue revelada no hará nada

  celda.revelada = true;        // cambio en el estado de la celda
  puntaje++;                    // suma puntaje
  actualizarPuntaje();          // actualiza el puntaje en pantalla

  // si ya se ganó
  if(checarVictoria()){
    juegoActivo =   false; // detiene el juego 
    mostrarMensajeFinal("¡¡¡¡FELICIDADES.Has ganado !!!!"); // mensaje de feilicitación
    actualizarRecord();                                     // actualizacion del record
    return;
  }

  const div = document.getElementById(`cell-${f}-${c}`); // obteniendo las celdas del html
  div.classList.add("revelada");                         // se cambia a la subclase revelada, para mostrar el otro diseño

  // en caso de que sea una bomba
  if (celda.esBomba) {
    div.classList.add("bomba"); // se cambia al diseño de la bomba
    div.textContent = "💣";     // se colocará el emoji de la bomba
    juegoActivo = false;        // cambio en el estado del juego 

    actualizarRecord();         // se cambia el record

    setTimeout(() => {          // pequeño dilay antes de mostrar el mensaje
      revelarTodo();            // es revelan todas las minas restantes
      mostrarMensajeFinal(      // se miuestra el mensaje
        "💥 ¡BOOM! Has perdido. ¿Quieres intentarlo de nuevo?" // mensaje
      );
    }, 100);
    return;
  }

  if (celda.bombasCerca > 0) {
    div.textContent = celda.bombasCerca; // diseño de la bomba
    return;
  }

  // Expansión 3x3
  for (let i = -1; i <= 1; i++) {       // mismo caso que arriba, cheaca las 8 celdas de alredor
    for (let j = -1; j <= 1; j++) {
      const nf = f + i;
      const nc = c + j;
      if (
        nf >= 0 &&
        nf < numFilas &&
        nc >= 0 &&
        nc < numColumnas &&
        !(i === 0 && j === 0)
      ) {
        const vecino = tablero[nf][nc];   // declara un
        const divVecino = document.getElementById(`cell-${nf}-${nc}`); // obtiene las celdas
        if (!vecino.revelada && !vecino.esBomba) {  // si esta vacia
          vecino.revelada = true;                   // se revela
          divVecino.classList.add("revelada");      // se cambia el diseño
          puntaje++;                                // se aumenta el puntaje
          actualizarPuntaje();                      // se actualiza el puntaje

          if (vecino.bombasCerca > 0) {             // si hay bombas cerca
            divVecino.textContent = vecino.bombasCerca; // cambio de diceño
          } else {
            revelarCelda(nf, nc);                     // si no, solo se revela la celda
          }
        }
      }
    }
  }
}

// función para la actulización del puntaje
function actualizarPuntaje() {
  const puntajeEl = document.getElementById("puntaje-text");    // obtiene en donde se pone el texto 
  puntajeEl.textContent = `Puntaje: ${puntaje}`;                // asigna el puntaje acumulado
}

// función apra revelar todas las casillas
function revelarTodo() {
  for (let f = 0; f < numFilas; f++) {      // recorre las filas
    for (let c = 0; c < numColumnas; c++) { // recorre las columnas
      const celda = tablero[f][c];          // guarda las coordenadas como celdas
      const div = document.getElementById(`cell-${f}-${c}`);    // obtiene le grid
      
      if (!celda.revelada) { // si aun no se revela
        celda.revelada = true;  // se cambia la bandera
        div.classList.add("revelada");  // se cmabia el estilo al revelado

        if (celda.esBomba) {                  // si es una  bomba
          div.classList.add("bomba");         // se le camibia a una bomba
          div.textContent = "💣";             // se coloca el emoji de la bomba
        } else if (celda.bombasCerca > 0) {   // si tiene bombas cerca
          div.textContent = celda.bombasCerca; // se cambia al estilo de que es una bomba cercana
        }
      }
    }
  }
}

// función para mostrar el mensaje final
function mostrarMensajeFinal(texto) { // recibe el texto 
  const mensajeDiv = document.getElementById("mensaje-final");      // obtiene le donde esatara el mensaje final
  const textoMensaje = document.getElementById("texto-mensaje");    // obtiene el donde estará el texto del mensaje final
  textoMensaje.textContent = texto;                                 // coloca el texto en cuestión
  mensajeDiv.style.display = "block";                               // muestrá el estilo block
}

// función para reicnicial el juego
function reiniciarJuego() {
  document.getElementById("mensaje-final").style.display = "none";  // dejara vacio el mensaje funil ( en caso de haber)
  iniciar.click(); // Simula hacer clic en "Iniciar"                    
}

// función para colocar un banderin
function Banderin(f, c) {   // se recibe la columan  la fila
  if (!juegoActivo) return;           // si no esta el juego activo no hace nada

  const celda = tablero[f][c];      // coordenada de la celda
  const div = document.getElementById(`cell-${f}-${c}`);    // estilo de la celda

  if (celda.revelada) return;     // si es ubna celda revelada no hará nada

  if (celda.banderin) {           // si ya se tiene el banderin
    celda.banderin = false;       // se quita
    div.classList.remove("banderin"); // se quita el estilo del banderin
    div.textContent = "";             // se quita el emoji del banderin
  } else {                        // en caso de que no
    celda.banderin = true;        // se cambia el estado de la celda
    div.classList.add("banderin");// se coloca al estilo del banderin
    div.textContent = "🚩";       // se coloca el emoji del banderin
  }
    if(checarVictoria()){         // si se ha ganado 
    juegoActivo = false;          // se acaba el juego
    mostrarMensajeFinal("¡¡¡¡FELICIDADES.Has ganado !!!!"); // mensaje
    actualizarRecord();           // se actualiza el record
  }
}

// funcion para actualizar el record
function actualizarRecord(){
  const recordGuardado = localStorage.getItem("mejorRecord"); // se obtine en donde estará
  if(!recordGuardado || puntaje > parseInt(recordGuardado)){   // si no se a colocado o si el puntaje es meyot al record
    localStorage.setItem("mejorRecord", puntaje);              // se coloca el puntaje actual
  }
}
// funcion para mostrar el record
function mostrarRecord(){
  const recordGuardado = localStorage.getItem("mejorRecord") || 0;        // se colocara el record que se tenca, de lo contrario será 0
  document.getElementById("record").textContent = `Mejor récord: ${recordGuardado}`;  // de tendrá como el mejor record
}

// funcion para cheacr la victoria 
function checarVictoria(){
  for (let f = 0; f < numFilas; f++){         // se recorren als filas
    for (let c = 0; c < numColumnas; c++){    // se recorren las columans
      const celda = tablero[f][c];            // se hace la celda
      if(celda.esBomba && !celda.banderin){   // si no hay banderin  y hay bomba
                console.log(`Bomba sin banderín en (${f}, ${c})`); // mensaje para la consola
        return false;                         // aun no se gana
      }
      if (!celda.esBomba && !celda.revelada){ // si no hay bomba y no ha sido evelada
                console.log(`Celda segura no revelada en (${f}, ${c})`); // mensaje para la consola
        return false;     // aún no se gana
      }
    }
  }
  return true;    // se se llega a este punto es por que se ha ganado
}