const calcularBtn = document.getElementById("no-group-data-calcular");

async function getTablaDatosSueltos() {
    const columns = document.querySelectorAll("#no-group-data-table .column");
    let error = "";

    const marcasClaseSet = new Set(); // Unicidad
    const marcasClase = Array.from(columns[0].getElementsByTagName("textarea")).map(
        (textarea, index) => {
            const value = textarea.value.trim();
            const numberValue = parseFloat(value);

            if (isNaN(numberValue)) {
                error = `Error: El valor de la marca de clase en la fila ${index + 1} no es un número válido ("${value}"),
                Asegúrese que utilice números.`;
            }

            if (marcasClaseSet.has(value)) {
                error = `Error: La marca de clase en la fila ${index + 1} ("${value}") está repetida. Las marcas de clase deben ser únicas.`;
            } else {
                marcasClaseSet.add(value); // Agregar al Set para rastrear unicidad
            }

            return numberValue;
        }
    );
    
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

    if (error !== "") {
        return { error: error };
    }

    // Combina marcasClase y frecuencias en pares
    const pairedData = marcasClase.map((marca, index) => ({
        marca: marca,
        frecuencia: frecuencias[index],
    }));

    // Ordena los pares por marca de clase (menor a mayor)
    pairedData.sort((a, b) => a.marca - b.marca);

    // Separa nuevamente en dos arrays: marcasClase y frecuencias
    const sortedMarcasClase = pairedData.map((data) => data.marca);
    const sortedFrecuencias = pairedData.map((data) => data.frecuencia);

    return {
        marcasClase: sortedMarcasClase,
        frecuencias: sortedFrecuencias,
    };
}

async function getDatosSueltosSimples(tablaFrecuencias) {
    const marcasClase = tablaFrecuencias.marcasClase;
    const frecuencias = tablaFrecuencias.frecuencias;

    const frecuenciasAbsolutasAcumuladas = await getArrayAcumulativa(frecuencias);
    const numData = frecuenciasAbsolutasAcumuladas[frecuenciasAbsolutasAcumuladas.length - 1];

    const frecuenciasRelativas = [];
    for(let i=0; i<frecuencias.length; i++) {
        frecuenciasRelativas.push(frecuencias[i]/numData);
    }
    const frecuenciasRelativasAcumuladas = await getArrayAcumulativa(frecuenciasRelativas);
    const frecuenciaPorcentual = [];
    for(let i=0; i < frecuencias.length; i++) {
        frecuenciaPorcentual.push(frecuenciasRelativas[i] * 100);
    }
        
    const valorMax = Math.max(... marcasClase); 
    const valorMin = Math.min(... marcasClase);
    const rango = valorMax - valorMin;

    const maxFrecuencia = Math.max(... frecuencias);

    // Promedio
    const sumatoriaDatos = await getComplexSumatoria(
        marcasClase, frecuencias,
        (marcaClaseI, frecuenciaI) => {
            return marcaClaseI * frecuenciaI;
        },
        (marcaClaseI, frecuenciaI) => {
            return `(${marcaClaseI} \\cdot ${frecuenciaI})`;
        }
    )
    const promedio = sumatoriaDatos.total / numData;

    //// Mediana
    async function getDatoByFrecuenciaAcumulada(index) {
        for (let i = 0; i < frecuenciasAbsolutasAcumuladas.length; i++) {
            if (index <= frecuenciasAbsolutasAcumuladas[i]) {
                return i;
            }
        }
    }
    
    const medianaIndex = Math.floor(numData /2);

    const firstMediana = marcasClase[await getDatoByFrecuenciaAcumulada(medianaIndex)];
    const secondMediana = marcasClase[await getDatoByFrecuenciaAcumulada(medianaIndex + 1)];

    const mediana = (numData % 2 === 0) ? 
        (firstMediana + secondMediana) / 2: firstMediana;

    //// Moda
    const moda = [];
    for(const dato in frecuencias) {
        if (frecuencias[dato] == maxFrecuencia) {
            moda.push(Number(marcasClase[dato]));
        }
    }

    //// Varianza
    const sumatoriaVarianza = await getComplexSumatoria(
        frecuencias, marcasClase,
        (fi, xi) => {
            return fi * Math.pow(xi - promedio, 2);
        },
        (fi, xi) => {
            return `(${fi} \\cdot (${xi} - \\bar{x})^{2})`
        }
    )
    sumatoriaVarianza.numDatos = numData;
    const varianzaPoblacion = sumatoriaVarianza.total/(numData);
    const varianzaMuestra = sumatoriaVarianza.total/(numData - 1);

    ////Desviacion Estandar
    const desviacionEstandarPoblacion = Math.sqrt(varianzaPoblacion);
    const desviacionEstandarMuestra = Math.sqrt(varianzaMuestra);

    /// Coeficiente de Variación (CV)
    const coeficienteVaricionPoblacion =  ((desviacionEstandarPoblacion) / promedio) * 100;
    const coeficienteVaricionMuestra =  ((desviacionEstandarMuestra) / promedio) * 100;


    //// Varianza
    const sumatoriaDesviacionMedia = await getComplexSumatoria(
        frecuencias, marcasClase,
        (fi, xi) => {
            return fi * Math.abs(xi - promedio);
        },
        (fi, xi) => {
            return `(${fi} \\cdot |${xi} - \\bar{x}|)`
        }
    )

    sumatoriaDesviacionMedia.numDatos = numData;
    const desviacionMedia = sumatoriaDesviacionMedia.total/numData;

    return {
        datosOrdenados: null,

        tablaFrecuencias: {
            marcasClase: marcasClase,
            
            frecuencias: frecuencias,
            frecuenciasAbsolutasAcumuladas: frecuenciasAbsolutasAcumuladas,
            
            frecuenciasRelativas: frecuenciasRelativas,
            frecuenciasRelativasAcumuladas: frecuenciasRelativasAcumuladas,

            frecuenciaPorcentual: frecuenciaPorcentual
        },

        datosAgrupados: false,
        valorMax: valorMax,
        valorMin: valorMin,
        rango: rango,
        
        maxFrecuencia: maxFrecuencia,

        promedio: {
            data: {
                sum: sumatoriaDatos,
                numDatos: numData
            },
            result: promedio
        },

        mediana: {
            data: {
                isPromedio: (numData%2 == 0),
                firstMediana: firstMediana,
                secondMediana: secondMediana
            },
           result: mediana
        },

        moda: {
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
            },
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

async function calcularDatosSueltosTable() {
    const tablaFrecuencias = await getTablaDatosSueltos();
    if (tablaFrecuencias.error) {return error.innerHTML = tablaFrecuencias.error};
    error.innerHTML = ""; 

    // Datos Sueltos
    const datosSueltosSimples = await getDatosSueltosSimples(tablaFrecuencias);
    await setResultados(datosSueltosSimples);
    await setGraphics(datosSueltosSimples);
    console.log(datosSueltosSimples);
}

calcularBtn.addEventListener("click", calcularDatosSueltosTable)