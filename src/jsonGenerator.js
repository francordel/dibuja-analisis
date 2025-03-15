export function generar_dict(fila, col_inicio, col_fin, lista_filas_anteriores, emptyCont) {
    let emptyCounter = emptyCont;
    let dict = {};
    let columnas = fila.getElementsByTagName("td");
    if (lista_filas_anteriores.length == 0) {
        let unionPalabras = "";
        if (col_inicio == col_fin) {
            return {
                dictionary: columnas[col_fin].firstChild.nodeValue,
                counter: emptyCounter
            }

        }
        for (let i = col_inicio; i <= col_fin - 1; i++) {
            unionPalabras = unionPalabras + columnas[i].firstChild.nodeValue + " ";
        }
        unionPalabras = unionPalabras + columnas[col_fin].firstChild.nodeValue;
        return {
            dictionary: unionPalabras,
            counter: emptyCounter
        };
    } else {

        let contador = 0;
        let contadorColumna = 0;
        let listaProvisional = [];
        while (contador < col_inicio) {
            let columna = columnas[contadorColumna];
            let colspan = columna.getAttribute('colspan');
            if (colspan == null) {
                colspan = 1;
            }
            contadorColumna += 1;
            contador += parseInt(colspan);
        }

        let fila_anterior = lista_filas_anteriores[0];
        lista_filas_anteriores.shift();

        while (contador <= col_fin) {

            let columna = columnas[contadorColumna];
            let colspan = columna.getAttribute('colspan');
            if (colspan == null) {
                colspan = 1;
                let etiqueta = "_" + emptyCounter.toString();
                //Ya existe la clave en el diccionario

                emptyCounter++;
                let result = generar_dict(fila_anterior, contador, contador + colspan - 1, [...lista_filas_anteriores], emptyCounter);
                dict[etiqueta] = result.dictionary;
                emptyCounter = result.counter;

            } else {
                colspan = parseInt(colspan);
                let etiqueta = columna.querySelector("span").innerHTML;
                let result = generar_dict(fila_anterior, contador, contador + colspan - 1, [...lista_filas_anteriores], emptyCounter);
                dict[etiqueta] = result.dictionary;
                emptyCounter = result.counter;

            }
            contador += colspan;
            contadorColumna += 1;
        }
    }

    return {
        dictionary: dict,
        counter: emptyCounter
    };
}
