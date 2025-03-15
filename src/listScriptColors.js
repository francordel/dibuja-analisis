import categorias from "./categorias.js";

const wrapperColor = document.querySelector(".listColorWrapper");
const selectColor = document.querySelector(".select-color");
const colorOptions = document.querySelector("#colorOptions");

var selectedGroup = ""; // Variable para el color seleccionado
var coloresSel = { "Negro": "black","Verde": "green", "Morado": "purple", "Naranja": "orange", "Azul": "blue" };
var selectedNode = null;
var selectedStart = 0;
var selectedEnd = 0;

selectColor.addEventListener("click", (e) => {
    wrapperColor.classList.toggle("active");
    e.stopPropagation();
});

export function updateColorSelector(selectedLi) {
    wrapperColor.classList.remove("active");
    selectedGroup = coloresSel[selectedLi.innerText]; // Usa coloresSel correctamente
    let spanText = selectColor.querySelector("span");

    if (spanText) {
        spanText.innerText = selectedLi.innerText; // Muestra el nombre del color
        spanText.style.color = selectedGroup; // Cambia el color del texto del selector
    }

    console.log("Color seleccionado:", selectedGroup);
}

export function getSelectedColor() {
    return selectedGroup;
}

export function crearColorSelector() {
    colorOptions.innerHTML = ""; // Limpia opciones previas

    for (const element in coloresSel) {
        let etiqueta = document.createElement('li');
        etiqueta.textContent = element;
        etiqueta.style.color = coloresSel[element];
        colorOptions.appendChild(etiqueta);
        
        // Agrega el evento correctamente
        etiqueta.addEventListener("click", () => updateColorSelector(etiqueta));
    }
}

document.onselectionchange = () => {
    let selection = document.getSelection();
    if (selection.type == "Range" && selection.anchorNode.parentElement.classList.contains("anotacion")) {
        selectedNode = selection.anchorNode;
        selectedStart = selection.anchorOffset;
        selectedEnd = selection.focusOffset;
    }
};