import categorias from "./categorias.js";

var accent_map = { 'á': 'a', 'é': 'e', 'è': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'Á': 'a', 'É': 'e', 'È': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u' };
const wrapper = document.querySelector(".listWrapper");
const selectBtn = document.querySelector(".select-btn");
const searchEngine = document.querySelector(".Search");
const optionsSearch = document.querySelector("#options");
var selectedGroup = "";

// Crear la lista de categorías una sola vez
function populateCategoryList() {
    let fragment = document.createDocumentFragment();
    Object.keys(categorias).forEach(data => {
        let opcion = document.createElement('li');
        opcion.textContent = data;
        opcion.onclick = () => updateSelector(opcion);
        fragment.appendChild(opcion);
    });
    optionsSearch.appendChild(fragment);
}

// Cargar categorías al inicio
populateCategoryList();

// Filtrar en tiempo real sin eliminar elementos
searchEngine.addEventListener("keyup", () => {
    let searchValue = searchEngine.value.toLowerCase().trim();
    let opciones = optionsSearch.children;
    for (let i = 0; i < opciones.length; i++) {
        let categoria = eliminar_acentos(opciones[i].textContent.toLowerCase());
        opciones[i].style.display = categoria.includes(searchValue) ? "block" : "none";
    }
});

function eliminar_acentos(s) {
    if (!s) { return ''; }
    return s.split('').map(char => accent_map[char] || char).join('');
}

selectBtn.addEventListener("click", (e) => {
    wrapper.classList.toggle("active");
    searchEngine.focus();
    e.stopPropagation();
});

document.addEventListener("click", (e) => {
    if (wrapper.classList.contains("active") && document.activeElement.className !== "Search") {
        wrapper.classList.remove("active");
    }
});

export function updateSelector(selectedLi) {
    wrapper.classList.remove("active");
    selectedGroup = categorias[selectedLi.innerText];
    let spanText = selectBtn.querySelector("span");
    spanText.innerText = categorias[selectedLi.innerText];
}

export function getSelectedGroup() {
    return selectedGroup;
}
