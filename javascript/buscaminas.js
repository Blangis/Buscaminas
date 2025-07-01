const grid = document.getElementById("cells");

function casillasTablero(numFilas, numColumnas) {
  for (let f = 0; f < numFilas; f++) {
    for (let c = 0; c < numColumnas; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${f}-${c}`; /* Ej de id: cell-12-26 */
      grid.appendChild(cell);
    }
  }
}

casillasTablero(20, 40);

function random_cell_id() {
  let maxf = 20;
  let maxc = 40;
  let numfila = Math.floor(Math.random() * maxf);
  let numColumna = Math.floor(Math.random() * maxc);
  console.log("NumFila: " + numfila, "num colum" + numColumna);
  let coordenada = `cell-${numfila}-${numColumna}`;
  return coordenada;
}

function addMinas(numMinas) {
  const colocadas = new Set();
  const minas = new Set();

  while (colocadas.size < numMinas) {
    let id = random_cell_id();
    if (!colocadas.has(id)) {
      colocadas.add(id);
      let celda = document.getElementById(id);
      if (celda) {
        celda.classList.add("mina");
        minas.add(id);
      }
    }
  }
  return minas;
}

const minasColocadas = addMinas(50);

// Agregar el evento a cada celda al hacer click
const todasLasCeldas = document.querySelectorAll(".cell");

todasLasCeldas.forEach((celda) => {
  celda.addEventListener("click", () => {
    if (minasColocadas.has(celda.id)) {
      celda.classList.add("bomba");
    } else {
      celda.classList.add("revelada");
    }
  });
});
