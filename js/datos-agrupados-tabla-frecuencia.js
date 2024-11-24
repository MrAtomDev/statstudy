const calcularDatosAgrupadosBtn = document.getElementById("grouped-data-calcular");

async function getTablaDatosAgrupados() {
    const columns = document.querySelectorAll("#grouped-data-table .column");
    let error = "";

    // Obtener los intervalos
    const intervalos = Array.from(columns[0].querySelectorAll(".interval-input")).map(
        (interval, index) => {
            const limits = Array.from(interval.querySelectorAll("textarea"));

            const limitInferior = parseFloat(limits[0].value);
            const limitSuperior = parseFloat(limits[1].value);

            if (isNaN(limitInferior)) {
                error = `Error: El valor del limite inferior de la fila ${index + 1} no es un número válido: ("${limits[0].value}")`;
            }

            if (isNaN(limitSuperior)) {
                error = `Error: El valor del limite superior de la fila ${index + 1} no es un número válido: ("${limits[1].value}")`;
            }

            return [limitInferior, limitSuperior];
        }
    );

    if (error !== "") { return { error: error }; }

    // Verificar que los intervalos no se solapen y están ordenados correctamente
    const intervalosOrdenados = intervalos
        .sort((a, b) => a[0] - b[0]) // Ordenar por límites inferiores
        .filter((intervalo, index, self) => {
            const esDuplicado = self.findIndex(([a, b]) => a === intervalo[0] && b === intervalo[1]) !== index;
            if (esDuplicado) {
                error = `Error: El intervalo [${intervalo[0]}, ${intervalo[1]}) ya existe.`;
                return false;
            }

            // Verificar que el siguiente limite inferior sea el limite superior de esta clase
            if (intervalos[index + 1]) {
                if (intervalos[index + 1][0] !== intervalo[1]) {
                    error = `Error: El límite inferior de la clase de la fila ${index + 2} (${intervalos[index + 1][0]}) 
                    no coincide con el limite superior de la clase de la fila ${index + 1} (${intervalo[1]})`
                }
            }

            // Verificar que el limite inferior no sea mayor al limite superior
            if (intervalo[0] > intervalo[1]) {
                error = `Error: El límite inferior de la clase de la fila ${index+1} (${intervalo[0]})
                es mayor al limite superior (${intervalo[1]})
                `;
            }
            return true;
        });
    
    if (error !== "") { return { error: error }; }

    // Verificamos que todos tengan la misma amplitud
    const standarAmplitudByFirstClass = intervalosOrdenados[0][1] - intervalosOrdenados[0][0];
    for(let index=0; index<intervalosOrdenados.length; index++) {
        const intervalo = intervalosOrdenados[index];
        const amplitud = intervalo[1] - intervalo[0];

        if (amplitud !== standarAmplitudByFirstClass) {
            error = `Error: la amplitud de la fila ${index + 1} (${amplitud})
            es diferente a la amplitud establecida por primer intervalo (${standarAmplitudByFirstClass})`;
            break;
        }
    }
    
    if (error !== "") { return { error: error }; }

    const frecuencias = Array.from(columns[1].getElementsByTagName("textarea")).map(
        (textarea, index) => {
            const value = textarea.value.trim();
            const numberValue = parseFloat(value);

            if (isNaN(numberValue)) {
                error = `Error: El valor de frecuencia en la fila ${index + 1} no es un número válido ("${value}").`;
            }

            return numberValue;
        }
    );

    if (error !== "") { return { error: error }; }

    const marcasClase = intervalosOrdenados.map((limite) => (limite[0] + limite[1]) / 2);

    return {
        intervalos: intervalosOrdenados,
        marcasClase: marcasClase,
        frecuencias: frecuencias
    };
}


/*
V1.0.0.0

async function getTablaDatosAgrupados() {
    const columns = document.querySelectorAll("#grouped-data-table .column");
    let error = "";
    
    const intervalos = Array.from(columns[0].querySelectorAll(".interval-input")).map(
        (interval, index) => {
            const limits = Array.from(interval.querySelectorAll("textarea"));
            
            const limitInferior = parseFloat(limits[0].value);
            const limitSuperior= parseFloat(limits[1].value);

            if(isNaN(limitInferior)) {
                error = `Error: El valor del limite inferior de la fila ${index + 1} no es un número válido: ("${limits[0].value}")`
            }

            if(isNaN(limitSuperior)) {
                error = `Error: El valor del limite superior de la fila ${index + 1} no es un número válido: ("${limits[1].value}")`
            }
            return [limitInferior, limitSuperior];
        }
    )
    if (error !== "") {return {error: error}}

    const frecuencias = Array.from(columns[1].getElementsByTagName("textarea")).map(
        (textarea, index) => {
            const value = textarea.value.trim();
            const numberValue = parseFloat(value);

            if (isNaN(numberValue)) {
                error = `Error: El valor de la frecuencia en la fila ${index + 1} no es un número válido ("${value}"),
                Asegúrese que utilice números.`;
            }

            return numberValue;
        }
    );
    if (error !== "") {return {error: error}}

    const marcasClase = intervalos.map((limite) => (limite[0] + limite[1])/2);

    return {
        intervalos: intervalos,
        marcasClase: marcasClase,
        frecuencias: frecuencias
    }
}
*/
async function getDatosAgrupados(tablasFrecuencia) {
    const intervalos = tablasFrecuencia.intervalos;
    const marcasClase = tablasFrecuencia.marcasClase;
    const frecuencias = tablasFrecuencia.frecuencias;

    // frecuencias absolutas acumuladas
    const frecuenciasAbsolutasAcumuladas = await getArrayAcumulativa(frecuencias);
    const numData = frecuenciasAbsolutasAcumuladas[frecuenciasAbsolutasAcumuladas.length - 1];

    // frecuencias relativas
    const frecuenciasRelativas = [];
    for(let i=0; i<frecuencias.length; i++) {
        frecuenciasRelativas.push(frecuencias[i]/numData);
    }

    // frecuencias relativas acumuladas
    const frecuenciasRelativasAcumuladas = await getArrayAcumulativa(frecuenciasRelativas)
    
    // frecuencias relativas porcentual
    const frecuenciaPorcentual = [];
    for(let i=0; i<frecuencias.length; i++) {
        frecuenciaPorcentual.push(frecuenciasRelativas[i] * 100);
    }

    /////// CALCULO DE LAS MEDIDAS DE TENDENCIA CENTRAL
    //// Promedio (Media aritmética)
    const promedioSum = await getComplexSumatoria(
        marcasClase,
        frecuencias,
        (dato1, dato2) => {
            return dato1 * dato2;
        },
        (dato1, dato2) => {
            return `(${dato1} \\cdot ${dato2})`
        }
    )
    const promedio = promedioSum.total/numData;

    //// Mediana
    const medianaIndex = (numData % 2 == 0)? numData/2 : (numData + 1)/2;
    let claseIndex;
    // Busqueda del indice de la mediana
    for(let i=0; i < frecuenciasAbsolutasAcumuladas.length; i++) {
        if (frecuenciasAbsolutasAcumuladas[i] > medianaIndex) {
            claseIndex = i;
            break
        }
    }

    let mediana;
    const medianaAmplitud = intervalos[claseIndex][1] - intervalos[claseIndex][0];
    const medianaIntervalo = intervalos[claseIndex];
    const medianali = medianaIntervalo[0];
    const lastMedianaFi = frecuenciasAbsolutasAcumuladas[claseIndex - 1] !== undefined?
    frecuenciasAbsolutasAcumuladas[claseIndex - 1]  : 0;
    const medianaFrecuenciaClase = frecuencias[claseIndex];

    if (medianaIndex == frecuenciasAbsolutasAcumuladas[claseIndex]) {
        mediana = medianaIntervalo[1]; // Es el limite superior
    } else {
        mediana = medianali + ((((numData/2) - lastMedianaFi) / medianaFrecuenciaClase)) * medianaAmplitud;
    }

    //// Moda
    const maxFrecuencia = Math.max(... frecuencias);
    let modaClaseIndex; 
    for (let index=0; index < frecuencias.length; index++) {
        if(frecuencias[index] == maxFrecuencia) {
            modaClaseIndex = index;
            break;
        }
    }

    const amplitudModa = intervalos[modaClaseIndex][1] - intervalos[modaClaseIndex][0];
    const modali = intervalos[modaClaseIndex][0];
    const frecuenciaModa = maxFrecuencia;

    const lastFrecuenciaModa = frecuencias[modaClaseIndex-1] !==  undefined ? 
        frecuencias[modaClaseIndex - 1] : 0;

    const nextFrecuenciaModa = frecuencias[modaClaseIndex+1] !==  undefined ?
        frecuencias[modaClaseIndex + 1] : 0;

    const moda = (modali) + ( ((frecuenciaModa - lastFrecuenciaModa)/( (frecuenciaModa - lastFrecuenciaModa) + (frecuenciaModa - nextFrecuenciaModa) )) * amplitudModa);


    //// Varianza
    const sumatoriaVarianza = await getComplexSumatoria(
        frecuencias,
        marcasClase,
        (frecuenciaI, marcaClaseI) => {
            return frecuenciaI * Math.pow((marcaClaseI - promedio), 2)
        },
        (frecuenciaI, marcaClaseI) => {
            return `(${frecuenciaI} \\cdot (${marcaClaseI} - \\bar{x})^{2})`
        }
    );
    sumatoriaVarianza.numDatos = numData;
    const varianzaPoblacion = sumatoriaVarianza.total / numData;
    const varianzaMuestra = sumatoriaVarianza.total / (numData - 1);


    // Desviación estandar
    const desviacionEstandarPoblacion = Math.sqrt(varianzaPoblacion);
    const desviacionEstandarMuestra = Math.sqrt(varianzaMuestra);

    // Coeficiente de Variación
    const coeficienteVaricionPoblacion = (desviacionEstandarPoblacion / promedio) * 100;
    const coeficienteVaricionMuestra = (desviacionEstandarMuestra / promedio) * 100;

    // Desviación media
    const sumatoriaDesviacionMedia = await getComplexSumatoria(
        frecuencias, marcasClase,
        (fi, xi) => {
            return fi * (Math.abs(xi - promedio)) ;
        },
        (fi, xi) => {
            return `(${fi}\\cdot |${xi} - \\bar{x}|)`
        }
    );
    sumatoriaDesviacionMedia.numDatos = numData;
    const desviacionMedia = sumatoriaDesviacionMedia.total/numData;


    return {
        datosAgrupados:true,
        intervalos: intervalos,

        tablaFrecuencias: {
            intervalos: intervalos,
            marcasClase: marcasClase,
            frecuencias: frecuencias,
            frecuenciasAbsolutasAcumuladas: frecuenciasAbsolutasAcumuladas,
            frecuenciasRelativas: frecuenciasRelativas,
            frecuenciasRelativasAcumuladas: frecuenciasRelativasAcumuladas,
            frecuenciaPorcentual: frecuenciaPorcentual
        },

        promedio: {
            data: {
                sum: promedioSum,
                numDatos: numData
            },
            result: promedio
        },

        mediana: {
            data: {
                isExactMiddle: (medianaIndex == frecuenciasAbsolutasAcumuladas[claseIndex]),
                limiteInferior: medianali,
                numData: numData,
                lastMedianaFrecuenciaAcumulada: lastMedianaFi,
                frecuenciaClase: medianaFrecuenciaClase,
                amplitud: medianaAmplitud
            },
            result: mediana
        },

        moda: {
            data: {
                limiteInferior: modali,
                frecuenciaClase: frecuenciaModa,
                lastFrecuenciaClase: lastFrecuenciaModa,
                nextFrecuenciaClase: nextFrecuenciaModa,
                amplitud: amplitudModa
            },
            result: moda
        },

        varianza: {
            poblacion: {
                data: sumatoriaVarianza,
                result: varianzaPoblacion
            },
            muestra: {
                data: sumatoriaVarianza,
                result: varianzaMuestra 
            }
        },

        desviacionEstandar: {
            poblacion: {
                data: sumatoriaVarianza,
                result: desviacionEstandarPoblacion
            },
            muestra: {
                data: sumatoriaVarianza,
                result: desviacionEstandarMuestra
            }
        },

        coeficienteVariacion: {
            poblacion: {
                data: {
                    desviacionEstandar: desviacionEstandarPoblacion,
                    promedio: promedio
                },
                result: coeficienteVaricionPoblacion
            },

            muestra: {
                data: {
                    desviacionEstandar: desviacionEstandarMuestra,
                    promedio: promedio
                },
                result: coeficienteVaricionMuestra
            }
        },

        desviacionMedia: {
            data: sumatoriaDesviacionMedia,
            result: desviacionMedia
        }
    }
}

async function calcularDatosAgrupadosTable() {
    const tablaFrecuencias = await getTablaDatosAgrupados();
    if (tablaFrecuencias.error) {return error.innerHTML = tablaFrecuencias.error};
    error.innerHTML = ""; 

    // Datos agrupados
    const datosAgrupados = await getDatosAgrupados(tablaFrecuencias);
    await setResultados(datosAgrupados);
    await setGraphics(datosAgrupados);
}

calcularDatosAgrupadosBtn.addEventListener("click", calcularDatosAgrupadosTable)