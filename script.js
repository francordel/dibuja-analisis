
//Iconos: https://fontawesome.com/v4/icons/
/*
    *Cada vez que accedo al documento uso DOM Document Object Managament
*/
import { updateSelector, getSelectedGroup } from "./src/listScript.js";
import { crearColorSelector } from "./src/listScriptColors.js";
import categorias from "./src/categorias.js";
import { generar_dict } from "./src/jsonGenerator.js";
import { getSelectedColor } from "./src/listScriptColors.js";

var fila_actual;
var separar = document.getElementById('separar')
var anotaciones;
var form = document.getElementById("fraseForm");
var frase;
var doList = [];
var undoList = [];
var lastcheckbox = -1;

const Direction = {
    UP: "up",
    DOWN: "down"
}

function crearBoton(lugarDondeCrear, id, icono, texto) {
    var boton = document.createElement('a');
    boton.id = id;
    boton.className = "clickable fit_width"
    boton.href = '#';
    lugarDondeCrear.appendChild(boton);
    //Creo el icono de anotar
    var imagen = document.createElement('i');
    //Le digo el tipo de icono quiero en el className (Importé la url del estilo en el css)
    imagen.className = icono;
    boton.appendChild(imagen);
    //Le pongo el texto al boton
    var etiqueta = document.createTextNode(texto);
    boton.appendChild(etiqueta);
    return boton;
}

function checkBoxFunctionality(table, event) {
    let tdPalabras = table.querySelectorAll("tr")[0].querySelectorAll("td");
    tdPalabras[event.target.columna - 1].classList.toggle("selectedWord");
    let tdCheckbox = table.querySelectorAll("tr")[1].querySelectorAll("td");
    if (lastcheckbox != -1) {
        if (lastcheckbox < event.target.columna - 1) {
            for (let i = lastcheckbox + 1; i < event.target.columna - 1; i++) {
                if (!tdCheckbox[i].firstChild.checked) {
                    tdCheckbox[i].firstChild.click();
                }
            }
        } else {
            for (let i = event.target.columna; i < lastcheckbox; i++) {
                if (!tdCheckbox[i].firstChild.checked) {
                    tdCheckbox[i].firstChild.click();
                }
            }
        }
    }
    if (tdPalabras[event.target.columna - 1].classList.contains("selectedWord")) {
        lastcheckbox = event.target.columna - 1;
    } else {
        lastcheckbox = -1
    }
}

function borrarChecks(tabla) {
    let trChecks = tabla.querySelectorAll("tr")[1];
    let inputs = trChecks.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].onchange == null) {
            inputs[i].columna = i + 1;
            inputs[i].onchange = (event) => { checkBoxFunctionality(tabla, event) };
        }
        if (inputs[i].checked) {
            inputs[i].click();
        }
    }
}

function borrarCelda() {

    var tabla = document.getElementsByTagName('table');
    addUndoList(tabla[0].cloneNode(true));

    //Obtengo los checkbox
    var cbs = document.getElementsByClassName('checkbox')
    //Numero de checkbox marcados
    var contador_chequeados = 0;
    //indice de la primera columna seleccionada
    var primera_columna = 0;
    //booleano que nos dice si estamos la primera columna seleccionada
    var en_primera_columna = true;

    var cellsToDelete = [];

    //Variable que contiene el checkbox siguiente por el que vamos
    var columnas = fila_actual.getElementsByTagName("td");
    let copiaColumnas = [...columnas];

    //Recorremos los checkbox buscando los chequeados
    let columnaActual = 0;
    //Numero de checkbox por donde voy
    var contador = parseInt(copiaColumnas[columnaActual].getAttribute('colspan'));
    if (isNaN(contador)) {
        contador = 1;
    }
    for (const check of cbs) {
        /*La idea es ver en que columna cae teniendo en cuenta el colspan
        añadir el indice de la columna a borrar y cuando se supere el colspan
        aumentar columna actual y alguna otra variable que sera necesaria,
        luego simplemente se recorren esas columnas y si es simple se hara
        un set y si es compleja un breakIntoCells*/
        if (contador <= 0) {
            columnaActual += 1;
            contador = parseInt(copiaColumnas[columnaActual].getAttribute('colspan'));
            if (isNaN(contador)) {
                contador = 1;
            }
        }
        if (check.checked) {
            if (!cellsToDelete.includes(columnaActual)) {
                cellsToDelete.push(columnaActual);
            }
        }
        contador--;
    }

    //!Si cuando has salido del bucle no hay primera columna no ha seleccionado ninguna palabra
    if (cellsToDelete.length == 0) {
        //!swal es un mensaje de error bonito, lo has importado en el script
        swal({
            title: "¡Error!",
            text: "¡Tienes que seleccionar al menos una palabra!",
            icon: "error",
        });

        return;
    }


    //Cogemos el número de filas de la tabla
    var filas = tabla[0].getElementsByTagName('tr');

    /*
    *Si son 2 bajamos a la siguiente linea pues es la primera vez que dibujamos ya que hay 2 filas
    *La primera linea son las palabras de la frase introducida
    *La segunda linea son los checkboxes
    */
    if (filas.length == 2) {
        return;
    }

    //Empezando a borrar desde el final funciona, ya que al primero modificar los ultimos
    //las nuevas columnas no afectan a las anteriores
    while (cellsToDelete.length != 0) {
        let cell = cellsToDelete.pop();
        let colspan = parseInt(copiaColumnas[cell].getAttribute('colspan'));
        if (isNaN(colspan)) {
            colspan = 1;
        }

        if (colspan == 1) {

            columnas[cell].firstChild.nodeValue = "";
            columnas[cell].setAttribute('style', "border-top: 0px");
            columnas[cell].removeAttribute('colspan');
            columnas[cell].className = '';
        } else {

            breakColspanIntoCells(fila_actual, columnas[cell])
        }
    }
    borrarChecks(tabla[0]);
}

function updateCells(colspan, cell, cells) {
    cells = cells.map((valor) => {
        if (valor > cell) {
            return valor += colspan - 1;
        }
        return valor;
    })

}

function selectColor() {
    console.log("Patatas fritas");
}



//Función que separa por palabras la frase que introduces
function setUpAnalizator() {
    // Recupera frase
    frase = document.getElementById('frase').value.replace(/\s+/g, " ");

    let listaContainer = document.querySelector(".painter_options");
    listaContainer.style.display = "flex";

    //* Fragmenta la frase por los espacios para obtener lista de palabras
    //*? Usar otros caracteres de separación como , etc*/
    let palabras = frase.trim().split(" ");
    palabras.push("");

    //* Elimina componentes de separar para pasar a la funcionalidad
    var datos = document.getElementById('datos')
    var inputs = datos.getElementsByTagName('input');
    //se elimina el elemento
    form.removeChild(inputs[0])
    var controles = document.getElementById('controles')
    var botones = controles.getElementsByTagName('a')
    var controles_desplazamiento = document.getElementById('desplazamiento')
    //Eliminamos el boton de separar
    controles.removeChild(botones[0])

    //* Añade nuevos componentes 
    var table = document.createElement('table');
    table.id = 'table'
    datos.appendChild(table);
    //*tr se refiere a table row es una fila de la tabla
    var tr = document.createElement('tr');
    //Añadimos la fila de las palabras
    table.appendChild(tr)

    //*td es cada columna de la tabla, cada palabra estará en una columna
    //Ponemos cada palabra separada en cada columna de la tabla
    for (const palabra of palabras) {
        var td = document.createElement('td');
        tr.appendChild(td);
        var texto = document.createTextNode(palabra);
        td.className = "form-text"
        td.appendChild(texto);
    }

    //*Añadimos la fila de los checkbox
    tr = document.createElement('tr');
    table.appendChild(tr)
    var idx = 1;
    //Para cada palabra distinta de cadena vacia creamos su checkbox
    for (const palabra of palabras) {
        if (palabra == "") {
            break;
        }
        var td = document.createElement('td');
        tr.appendChild(td);
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.columna = idx;
        checkbox.id = 'check' + idx.toString();
        checkbox.className = 'checkbox';
        idx += 1;
        checkbox.value = palabra;
        checkbox.onchange = (event) => checkBoxFunctionality(table, event);
        td.appendChild(checkbox);
    }

    //crearBoton(controles, "guardar", "fa fa-download", " Guardar")

    // El botón que desencadena
    const botonCanvas = document.querySelector("#guardar"),
        // A qué le tomamos la foto
        $objetivo = document.querySelector("#datos");
    // Agregar el listener al botón
    //!METODO GUARDAR DEBERIA IR AQUÍ
    botonCanvas.addEventListener("click", () => { guardar(frase) });

    //Añadimos la accion de anotar
    var boton = document.querySelector("#anotar");
    boton.onclick = (e) => {
        anotar();
        e.preventDefault();
    };

    //Añadimos la accion de borrar
    boton = document.querySelector("#borrar");
    boton.onclick = (e) => {
        borrar();
        e.preventDefault();
    };

    //Añadimos las opciones
    anotaciones = document.getElementById("options");

    //Ordeno las claves
    var claves = Object.keys(categorias);
    claves.sort();
    //*Añado las opciones clave valor a la lista
    for (const clave of claves) {
        let opcion = document.createElement('li');
        opcion.textContent = clave;
        opcion.onclick = () => updateSelector(opcion);
        opcion.className = "option-tags"
        anotaciones.appendChild(opcion);
    }

    crearColorSelector();

    //colores = document.querySelector("#colores");

    //* Añade botón abajo
    boton = crearBoton(controles_desplazamiento, "abajo", 'fa fa-arrow-down', " Abajo")
    boton.onclick = (e) => {
        abajo();
        e.preventDefault();
    };

    //* Añade botón arriba
    boton = crearBoton(controles_desplazamiento, "arriba", 'fa fa-arrow-up', " Arriba")
    boton.onclick = (e) => {
        arriba();
        e.preventDefault();
    };

    //* Añade botón undo
    boton = crearBoton(controles_desplazamiento, "deshacer", "fa fa-undo", " Deshacer");
    boton.onclick = (e) => {
        undo();
        e.preventDefault();
    };

    //* Añade botón redo
    boton = crearBoton(controles_desplazamiento, "rehacer", 'fa fa-rotate-right', " Rehacer");
    boton.onclick = (e) => {
        redo();
        e.preventDefault();
    };

    //* Añade boton borrar checks
    boton = crearBoton(controles_desplazamiento, "borrarCheck", 'fa fa-rotate-right', " Borrar checks");
    boton.onclick = (e) => {
        borrarChecks(table)
        e.preventDefault();
    };

    boton = crearBoton(controles_desplazamiento, "borrarCelda", 'fa fa-rotate-right', " Borrar celda");
    boton.onclick = (e) => {
        borrarCelda();
        e.preventDefault();
    };

    //*Añade más botones aquí debajo si los necesitas

    let wrapper = document.querySelector(".wrapper");
    wrapper.style.marginTop = "0";
    wrapper.style.padding = "1%";

    //  let datos_profesor = document.querySelector("#datos_profesor");

    //datos_profesor.style.display = "flex";
}

function pintarFlecha(fila_a_seleccionar) {

    let columnasFila = fila_a_seleccionar.getElementsByTagName("td");
    let ultima = columnasFila[columnasFila.length - 1]
    let isImagePresent = ultima.getElementsByTagName("i").length;
    if (!isImagePresent) {
        let flecha = document.createElement("i");
        flecha.className = "fa fa-arrow-left";
        flecha.id = "flecha";
        ultima.appendChild(flecha);
    }
}

function removeflecha() {
    let flecha = document.querySelector("#flecha");
    if (flecha != null) {
        let parentNode = flecha.parentNode;
        parentNode.removeChild(flecha);
    }
}

function crearFilaTabla(tabla, filas, fila_actual, direction) {
    let tr = document.createElement('tr');
    if (direction == Direction.UP) {
        tr.className = "empty_arriba";
        tabla[0].insertBefore(tr, fila_actual);
    } else {
        tr.className = "empty_abajo";
        tabla[0].appendChild(tr);
    }

    let columnas = filas[0].getElementsByTagName('td');
    var i = 0;
    //Creamos los td con un textnode en ellos
    while (i < columnas.length) {
        let td = document.createElement('td');
        let contenido = document.createTextNode(' ');
        td.appendChild(contenido);
        tr.appendChild(td);
        i += 1;
    }

    return tr;
}

function breakColspanIntoCells(row, column) {

    let colspan = column.getAttribute('colspan');
    let nodeToDelete = column;
    let placeToInsert = column;

    for (let i = 0; i < colspan; i++) {
        let td = document.createElement("td")
        let contenido = document.createTextNode(' ');
        td.appendChild(contenido);
        //We insert the tds after the colspan cell
        placeToInsert = row.insertBefore(td, placeToInsert);

    }
    //Eliminamos la celda fusionada
    row.removeChild(nodeToDelete);
}

function addDoList(table) {
    if (doList.length > 4) {
        doList.shift();
    }
    doList.push(table);
}

function addUndoList(table) {
    if (undoList.length > 4) {
        undoList.shift();
    }
    undoList.push(table);
}


form.onsubmit = function (e) {
    e.preventDefault();
    setUpAnalizator();
};
form.on

separar.onclick = setUpAnalizator;


//*Función correspondiente a cuando le das al botón de anotar
function anotar() {

    //!Añadir mensaje de error
    if (getSelectedGroup() == "") {
        return
    }

    var tabla = document.getElementsByTagName('table');
    addUndoList(tabla[0].cloneNode(true));
    //Obtengo los checkbox
    var cbs = document.getElementsByClassName('checkbox')
    //Numero de checkbox por donde voy
    var contador = 0;
    //Numero de checkbox marcados
    var contador_chequeados = 0;
    //indice de la primera columna seleccionada
    var primera_columna = 0;
    //booleano que nos dice si estamos la primera columna seleccionada
    var en_primera_columna = true;

    //? Chequear que primera columna no tenga colspan ya
    //Variable que contiene el checkbox siguiente por el que vamos
    var check_siguiente = 0;
    //Recorremos los checkbox buscando los chequeados
    for (const check of cbs) {
        if (check.checked) {
            //Si es la primera columna checkeada nos lo guardamos pues lo necesitaremos para empezar a subrayar
            if (en_primera_columna) {
                primera_columna = contador;
                en_primera_columna = false;
                check_siguiente = primera_columna;
            }
            else {
                //!Comprobamos que no selecciones palabras separadas
                if (contador != check_siguiente) {
                    //!swal es un mensaje de error bonito, lo has importado en el script
                    swal({
                        title: "¡Error!",
                        text: "¡Tienes que seleccionar palabras seguidas!",
                        icon: "error",
                    });
                    return;
                }
            }
            //Avanzamos los checkeados
            contador_chequeados += 1;
            check_siguiente += 1;
        }
        contador++;
    }
    //!Si cuando has salido del bucle no hay primera columna no ha seleccionado ninguna palabra
    if (en_primera_columna) {
        //!swal es un mensaje de error bonito, lo has importado en el script
        swal({
            title: "¡Error!",
            text: "¡Tienes que seleccionar al menos una palabra!",
            icon: "error",
        });

        return;
    }


    //Cogemos el número de filas de la tabla
    var filas = tabla[0].getElementsByTagName('tr');

    /*
    *Si son 2 bajamos a la siguiente linea pues es la primera vez que dibujamos ya que hay 2 filas
    *La primera linea son las palabras de la frase introducida
    *La segunda linea son los checkboxes
    */
    if (filas.length == 2) {
        abajo();
    }

    //! nos importa que sea empty????
    //Comprobar si es una linea vacia para dejar de marcarla como tal
    if (fila_actual.getAttribute("class").includes("empty")) {
        fila_actual.setAttribute("class", "");
    };

    //*Obtenemos las columnas(td) de la fila actual 
    //! Cuidado: el número de columna tiene que considerar las columnas con colspan
    var columnas = fila_actual.getElementsByTagName("td");
    let copiaColumnas = [...columnas];
    var i = 0;
    var suma_colspan = 0;
    var colspan = 0;
    let aux_primera_columna = -1;
    while (i < copiaColumnas.length) {
        var td = copiaColumnas[i];
        if (td.hasAttribute('colspan')) {
            colspan = parseInt(td.getAttribute('colspan'));
            //! Si hay un grupo a sobreescribir de mas de una celda hay que hacer tratamiento especial
            let suma = suma_colspan + colspan - 1;

            if ((colspan > 1) && ((check_siguiente - 1 >= suma_colspan && suma_colspan + colspan - 1 >= check_siguiente - 1) || (primera_columna >= suma_colspan && suma_colspan + colspan - 1 >= primera_columna) || (primera_columna >= suma_colspan && suma_colspan + colspan - 1 >= check_siguiente - 1) || (primera_columna <= suma_colspan && suma_colspan + colspan - 1 <= check_siguiente))) {
                breakColspanIntoCells(fila_actual, copiaColumnas[i]);
                //Si se rompe significa que se ha seleccionado dentro de una con colspan que ahora esta dividida
                //Como tratar donde esta la primera columna?
                if (aux_primera_columna == -1) {
                    aux_primera_columna = i + primera_columna - suma_colspan;
                }
            }
        }
        else {
            colspan = 1;
        }
        suma_colspan = suma_colspan + colspan;
        //tener en cuenta colspan para la primera columna
        if (suma_colspan > primera_columna && aux_primera_columna == -1) {
            aux_primera_columna = i;
        }
        i += 1;

    }

    columnas = fila_actual.getElementsByTagName("td");
    primera_columna = aux_primera_columna;
    //Creamos la columna con un valor vacio y el color de fondo seleccionado
    //!con el setAttribute se sobreescriben los valores 
    if (contador_chequeados > 1) {
        for (let i = 0; i < contador_chequeados; i++) {
            if (primera_columna + i < columnas.length) {
                columnas[primera_columna + i].firstChild.nodeValue = " ";
                columnas[primera_columna + i].setAttribute('style', "border-top: 0px");
                columnas[primera_columna + i].className = '';
            }
        }
    }

    columnas[primera_columna].setAttribute('colspan', contador_chequeados);
    columnas[primera_columna].firstChild.nodeValue = getSelectedGroup();
    //columnas[primera_columna].setAttribute('style', 'color: #000000; border-top: 3px solid #000000; border-image: linear-gradient(to right, #000 50%, rgba(0,0,0,0) 50%); border-image-slice: 1;');
    let selectedColor = getSelectedColor() || "#000000"; // Por defecto negro si no hay color seleccionado

    columnas[primera_columna].setAttribute(
        "style",
        `color: ${selectedColor}; border-top: 3px solid ${selectedColor}; 
    border-image: linear-gradient(to right, ${selectedColor} 50%, rgba(0,0,0,0) 50%); border-image-slice: 1;`
    );
    columnas[primera_columna].className = 'anotacion';


    //Eliminamos las columnas sobrantes segun el colspan( numero de checks)
    let indice = 1;
    let num_columnas = fila_actual.childElementCount - 1;
    let aux = contador_chequeados;
    while (aux > 1) {
        fila_actual.removeChild(columnas[primera_columna + 1])
        indice += 1;
        aux--;
    }
    num_columnas = fila_actual.childElementCount - 1;

    // Obtenemos la fila y la columna y ponemos como valor el valor del diccionario poniendole el color seleccionado
    //y se le pone la clase anotación


    pintarFlecha(fila_actual);
    borrarChecks(tabla[0]);

}


//*Funcion correspondiente al boton cerrar
//! Si es pulsado borra TODA la fila actual
function borrar() {
    var tabla = document.getElementsByTagName('table');
    addUndoList(tabla[0].cloneNode(true));

    //Si es mayor que 2 significa que a escrito algo por lo tanto puede borrar la fila
    if (tabla[0].childElementCount > 2) {
        tabla[0].removeChild(fila_actual);
    } else {
        return;
    }
    var filas = tabla[0].getElementsByTagName('tr');
    let num_filas = tabla[0].childElementCount;

    //?Quizas esto podemos sustituirlo pues que no le dejo subir si esta en la linea actual aunque sospecho que sigue siendo necesario
    if (num_filas > 3) {
        fila_actual = filas[num_filas - 1];
        pintarFlecha(fila_actual)
    } else if (num_filas == 3) {
        fila_actual = filas[2]
        pintarFlecha(fila_actual)
    } else {
        fila_actual = null;
    }
}


//*Funcion que baja el cursor donde estamos trabajando
function abajo() {
    var tabla = document.getElementsByTagName('table');
    var filas = tabla[0].getElementsByTagName('tr');
    //Obtenemos en caso de que hayan lineas vacias
    var tr_empty = tabla[0].getElementsByClassName('empty_abajo');
    //Si hay alguna linea vacia no le dejamos seguir bajando
    //?Creamos una nueva linea, Solo deberiamos hacerlo cuando estamos en la ultima fila o no hay nada dibujado
    if ((Array.from(filas).indexOf(fila_actual) == (filas.length - 1) || filas.length <= 2) && tr_empty.length == 0) {
        let tr = crearFilaTabla(tabla, filas, fila_actual, Direction.DOWN);

        // Eliminamos la flecha de la fila texto
        removeflecha();

        fila_actual = tr;

    } else if (Array.from(filas).indexOf(fila_actual) < (filas.length - 1)) {
        //?Si no solo añadimos bajamos el cursor de la linea actual y del texto
        removeflecha();

        //Fila actual por donde pongo el subrayado
        fila_actual = filas[Array.from(filas).indexOf(fila_actual) + 1];
    }

    pintarFlecha(fila_actual);

}







//*Funcion que me permite subir el cursor a la linea siguiente es decir la linea actual sube a la linea de arriba
function arriba() {
    var tabla = document.getElementsByTagName('table');
    var filas = tabla[0].getElementsByTagName('tr');

    //!Si no esta en una fila erronea y si la fila actual es mayor que la 2 le dejamos subir si no NO
    var tr_empty = tabla[0].getElementsByClassName('empty_arriba');

    if (Array.from(filas).indexOf(fila_actual) == 2 && tr_empty.length == 0) {
        let tr = crearFilaTabla(tabla, filas, fila_actual, Direction.UP);

        // Eliminamos la flecha de la fila texto
        removeflecha();
        fila_actual = tr;

    } else if (Array.from(filas).indexOf(fila_actual) != -1 && Array.from(filas).indexOf(fila_actual) > 2) {

        // Eliminamos la flecha de la fila texto
        removeflecha();

        //Fila actual por donde pongo el subrayado
        fila_actual = filas[Array.from(filas).indexOf(fila_actual) - 1];

    }

    if (fila_actual != null) {
        pintarFlecha(fila_actual);
    }
}

function guardar(frase) {

    swal({
        title: "¿Quieres guardarla?",
        text: "Confirma que estás seguro de que has terminado",
        icon: "info",

        buttons: true,
        dangerMode: true,
        showCloseButton: true,


    })
        .then((willRegistered) => {
            if (willRegistered) {

                var tabla = document.getElementsByTagName('table');
                //tabla[0].style.cssText = 'color: #000;margin-left: auto;margin-right: auto;border-collapse: collapse; border: 0px 0px 0px 0px;';
                tabla[0].id = 'noBordes'
                var filas = tabla[0].getElementsByTagName('tr');
                //Para cada fila elimino su última columna para borrar la columna de la flecha
                let cols
                for (var fil = 0; fil < filas.length; fil++) {
                    filas[fil].id = 'noBordes'
                    cols = filas[fil].getElementsByTagName("td");
                    var col_fin = cols[cols.length - 1];
                    filas[fil].removeChild(col_fin);
                    for (var col = 0; col < cols.length; col++) {
                        cols[col].id = 'noBordes'

                        if (cols[col].classList.contains("anotacion")) {
                            let texto = document.createElement("span");
                            texto.innerHTML = cols[col].firstChild.nodeValue;
                            cols[col].firstChild.nodeValue = "";
                            texto.setAttribute('style', 'color:' + cols[col].style.color + "; border-top: 3px solid " + cols[col].style.color);
                            texto.classList.add("textoAnotacion")
                            cols[col].appendChild(texto);
                            cols[col].setAttribute("style", "");

                        }

                    }
                }
                //Borro la fila de los checkbox
                tabla[0].removeChild(filas[1]);

                let $objetivo = document.querySelector("#datos");
                html2canvas($objetivo).then(canvas => {
                    let enlace = document.createElement('a');
                    enlace.download = frase + ".png";
                    enlace.href = canvas.toDataURL();
                    enlace.click();

                    // **Generar JSON con los datos de la frase**
                    let tabla = document.querySelector("table");
                    let filas = tabla.getElementsByTagName("tr");
                    let copiaFilas = [...filas].reverse();
                    copiaFilas.shift();

                    let cols = filas[0].getElementsByTagName("td");
                    let jsonData = generar_dict(filas[filas.length - 1], 0, cols.length - 1, copiaFilas, 0).dictionary;

                    console.log("JSON Generado:", JSON.stringify(jsonData));

                    // **Aquí puedes hacer algo con el JSON, como guardarlo en localStorage o enviarlo a un servidor**
                });

                //Confirmo si quiere recargar la pagina	
                swal({
                    title: "¿Quieres recargar la página?",
                    text: "Si no recargas la página no vas a poder hacer otra frase nueva ",
                    icon: "info",

                    buttons: true,
                    dangerMode: true,
                    showCloseButton: true,


                })
                    .then((willRegistered) => {
                        if (willRegistered) {
                            //Recargo la pagina 
                            location.reload();
                        } else {

                        }
                    });

            } else {

            }
        });

}

function borrarFilasVacias(tabla) {
    //Las filas vacias son o la primera (1) o la ultima (length-1)

    let vacio_arriba = tabla.querySelector(".empty_arriba");
    let vacio_abajo = tabla.querySelector(".empty_abajo");

    if (vacio_abajo != undefined) {
        tabla.removeChild(vacio_abajo);
    }

    if (vacio_arriba != undefined) {
        tabla.removeChild(vacio_arriba);
    }

}

function undo() {
    if (undoList.length == 0) return;
    let tabla = document.querySelector("table");
    let tablaUndo = undoList.pop();
    let columnasUndo = tablaUndo.getElementsByTagName("tr");
    addDoList(tabla.cloneNode(true));
    tabla.replaceChildren()
    tabla.replaceChildren(...columnasUndo);

    let columnas = tabla.getElementsByTagName("tr");
    if (columnas.length > 2) {

        fila_actual = columnas[2];
        removeflecha();
        pintarFlecha(fila_actual);
    } else {
        fila_actual = null;
    }
    borrarChecks(tabla);
}

function redo() {
    if (doList.length == 0) return;
    let tabla = document.querySelector("table");
    let tablaRedo = doList.pop();
    let columnasRedo = tablaRedo.getElementsByTagName("tr");
    addUndoList(tabla.cloneNode(true));
    tabla.replaceChildren()
    tabla.replaceChildren(...columnasRedo);
    let columnas = tabla.getElementsByTagName("tr");
    if (columnas.length > 2) {

        fila_actual = columnas[2];
        removeflecha();
        pintarFlecha(fila_actual);
    } else {
        fila_actual = null;
    }
    borrarChecks(tabla);

}

//! No se usa firebase de moomento
/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";

import { getFirestore, doc, getDoc, getDocs, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAX5wo13UGDvQta2Bb9YrIgeZDt6QURb2k",
    authDomain: "tfg23-3e8bb.firebaseapp.com",
    databaseURL: "https://tfg23-3e8bb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tfg23-3e8bb",
    storageBucket: "tfg23-3e8bb.appspot.com",
    messagingSenderId: "648972228873",
    appId: "1:648972228873:web:05bc3a67e6909421f39bd8",
    measurementId: "G-9Y4YK8375W"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const db = getFirestore(app);
*/
