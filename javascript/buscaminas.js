const grid = document.getElementById("cells");
const select = document.getElementById("dificultad-select");
const iniciar = document.getElementById("iniciar-juego");

let tablero = [];
let juegoActivo = false;
let puntaje = 0;
let minas = 0;
let numFilas = 0;
let numColumnas = 0;

iniciar.addEventListener("click", () => {
  grid.innerHTML = "";
  tablero = [];
  puntaje = 0;
  actualizarPuntaje();
  juegoActivo = true;
  mostrarRecord();
  const dificultad = select.value;
  if (dificultad === "easy") {
    numFilas = 10;
    numColumnas = 10;
  } else if (dificultad === "medium") {
    numFilas = 20;
    numColumnas = 40;
  } else if (dificultad === "hard") {
    numFilas = 30;
    numColumnas = 60;
  }
  const estilos = getComputedStyle(document.documentElement);
  const anchoTablero = parseFloat(estilos.getPropertyValue('--ancho-tablero'));
  const altoTablero = parseFloat(estilos.getPropertyValue('--alto-tablero'));

  const anchoCelda = anchoTablero / numColumnas;
  const altoCelda = altoTablero / numFilas;


  grid.style.gridTemplateColumns = `repeat(${numColumnas}, ${anchoCelda}px)`;
  grid.style.gridTemplateRows = `repeat(${numFilas}, ${altoCelda}px)`;


  iniciarJuego();
});

function iniciarJuego() {
  // Lógica del tablero
  for (let f = 0; f < numFilas; f++) {
    const fila = [];
    for (let c = 0; c < numColumnas; c++) {
      fila.push({
        esBomba: false,
        revelada: false,
        bombasCerca: 0,
        banderin: false
      });
    }
    tablero.push(fila);
  }

  // Creando celdas
  casillasTablero(numFilas, numColumnas);

  // Colocando las minas
  const totalCeldas = numFilas * numColumnas;
  const minas = Math.floor(totalCeldas * 0.15); // 15%
  addMinas(minas);

  //AgAsignando eventos
  for (let f = 0; f < numFilas; f++) {
    for (let c = 0; c < numColumnas; c++) {
      const div = document.getElementById(`cell-${f}-${c}`);

      // Click izquierdo
      div.addEventListener("click", () => {
        revelarCelda(f, c);
      });

      // Click derecho (banderín)
      div.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // evita el menú del navegador
        Banderin(f, c);
      });
  }
  }
}

function casillasTablero(numFilas, numColumnas) {
  for (let f = 0; f < numFilas; f++) {
    for (let c = 0; c < numColumnas; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${f}-${c}`;
      grid.appendChild(cell);
    }
  }
}

function addMinas(numMinas) {
  const colocadas = new Set();

  while (colocadas.size < numMinas) {
    const f = Math.floor(Math.random() * numFilas);
    const c = Math.floor(Math.random() * numColumnas);

    if (!tablero[f][c].esBomba) {
      tablero[f][c].esBomba = true;
      colocadas.add(`${f}-${c}`);

      // Aumenta bombasCerca a vecinos
      for (let i = -1; i <= 1; i++) {
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
            tablero[nf][nc].bombasCerca++;
          }
        }
      }
    }
  }
}

function revelarCelda(f, c) {
  
  const celda = tablero[f][c];
  actualizarPuntaje();
  if (celda.banderin) return;
  if (!juegoActivo) return;
  if (!celda || celda.revelada) return;

  celda.revelada = true;
  puntaje++;
  actualizarPuntaje();

  if(checarVictoria()){
    juegoActivo = false;
    mostrarMensajeFinal("¡¡¡¡FELICIDADES.Has ganado !!!!");
    actualizarRecord();
    return;
  }

  const div = document.getElementById(`cell-${f}-${c}`);
  div.classList.add("revelada");

  if (celda.esBomba) {
    div.classList.add("bomba");
    div.textContent = "💣";
    juegoActivo = false;

    actualizarRecord();

    setTimeout(() => {
      revelarTodo();
      mostrarMensajeFinal(
        "💥 ¡BOOM! Has perdido. ¿Quieres intentarlo de nuevo?"
      );
    }, 100);
    return;
  }

  if (celda.bombasCerca > 0) {
    div.textContent = celda.bombasCerca;
    return;
  }

  // Expansión 3x3
  for (let i = -1; i <= 1; i++) {
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
        const vecino = tablero[nf][nc];
        const divVecino = document.getElementById(`cell-${nf}-${nc}`);
        if (!vecino.revelada && !vecino.esBomba) {
          vecino.revelada = true;
          divVecino.classList.add("revelada");
          puntaje++;
          actualizarPuntaje();

          if (vecino.bombasCerca > 0) {
            divVecino.textContent = vecino.bombasCerca;
          } else {
            revelarCelda(nf, nc);
          }
        }
      }
    }
  }
}

function actualizarPuntaje() {
  const puntajeEl = document.getElementById("puntaje-text");
  puntajeEl.textContent = `Puntaje: ${puntaje}`;
}

function revelarTodo() {
  for (let f = 0; f < numFilas; f++) {
    for (let c = 0; c < numColumnas; c++) {
      const celda = tablero[f][c];
      const div = document.getElementById(`cell-${f}-${c}`);

      if (!celda.revelada) {
        celda.revelada = true;
        div.classList.add("revelada");

        if (celda.esBomba) {
          div.classList.add("bomba");
          div.textContent = "💣";
        } else if (celda.bombasCerca > 0) {
          div.textContent = celda.bombasCerca;
        }
      }
    }
  }
}

function mostrarMensajeFinal(texto) {
  const mensajeDiv = document.getElementById("mensaje-final");
  const textoMensaje = document.getElementById("texto-mensaje");
  textoMensaje.textContent = texto;
  mensajeDiv.style.display = "block";
}

function reiniciarJuego() {
  document.getElementById("mensaje-final").style.display = "none";
  iniciar.click(); // Simula hacer clic en "Iniciar"
}


function Banderin(f, c) {
  if (!juegoActivo) return;

  const celda = tablero[f][c];
  const div = document.getElementById(`cell-${f}-${c}`);

  if (celda.revelada) return;

  if (celda.banderin) {
    celda.banderin = false;
    div.classList.remove("banderin");
    div.textContent = "";
  } else {
    celda.banderin = true;
    div.classList.add("banderin");
    div.textContent = "🚩";
  }
    if(checarVictoria()){
    juegoActivo = false;
    mostrarMensajeFinal("¡¡¡¡FELICIDADES.Has ganado !!!!");
    actualizarRecord();
  }
}

function actualizarRecord(){
  const recordGuardado = localStorage.getItem("mejorRecord");
  if(!recordGuardado || puntaje > parseInt(recordGuardado)){
    localStorage.setItem("mejorRecord", puntaje);
  }
}

function mostrarRecord(){
  const recordGuardado = localStorage.getItem("mejorRecord") || 0;
  document.getElementById("record").textContent = `Mejor récord: ${recordGuardado}`;
}


function checarVictoria(){
  for (let f = 0; f < numFilas; f++){
    for (let c = 0; c < numColumnas; c++){
      const celda = tablero[f][c];
      if(celda.esBomba && !celda.banderin){
                console.log(`Bomba sin banderín en (${f}, ${c})`);
        return false;
      }
      if (!celda.esBomba && !celda.revelada){
                console.log(`Celda segura no revelada en (${f}, ${c})`);
        return false;
      }
    }
  }
  return true;
}