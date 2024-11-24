const datos_sueltos_input = document.getElementById("datos-sueltos-input");
const calcular_button = document.getElementById("calcular-datos-sueltos");
const resultados_estadisticos = document.getElementById("stats-result");
const toAgruparDatos = document.getElementById("to-agroup-data");
const errorMsg = document.getElementById("error-msg");

async function getSumatoria(data, formato = (dato) => {return dato}, operationFormat = dato => dato) {
    let sum = 0; 
    data.forEach((number, index) => { 
        sum += operationFormat(number, index); 
    });

    let operation = formato(data[0]) +"+"+ formato(data[1]) +"+"+ formato(data[2]) + "+" + formato(data[3]) + "+ ... +" + formato(data[data.length - 1]);
    if (data.length <= 6) {
        operation = "";

        data.forEach((dato, index) => {
            operation += formato(dato);
            if (index + 1 < data.length) {
                operation += "+";
            }
        }) 
    }
    return {
        total: sum, 
        operation: operation
    };
}

async function getComplexSumatoria(arr1, arr2, operationFormat = (dato1, dato2)=>{return dato1*dato2}, formato = (dato1, dato2) => {return `${dato1} * ${dato2}`}) {
    let sum = 0;
    for(let i=0; i<(Math.min(arr1.length, arr2.length)); i++) {
        sum += operationFormat(arr1[i], arr2[i]);
    }

    let tableOperations = [];
    let operation = "Hola3";

    for(let i=0; i < Math.min(arr1.length, 5); i++) {
        tableOperations.push(formato(arr1[i], arr2[i]));
    }
    operation = tableOperations.join(" + ");

    if (arr1.length == 6) {
        operation += "+" + formato(arr1[arr1.length - 1], arr2[arr1.length - 1])
    } else if (arr1.length > 6) {
        operation += " + ... + " + formato(arr1[arr1.length - 1], arr2[arr1.length - 1])
    }

    return {
        total: sum,
        operation: operation
    }

}

async function getArrayAcumulativa(arr){
    const arrAcumulativo = [arr[0]];
    for(let i=1; i < arr.length; i++) {
        arrAcumulativo.push(arrAcumulativo[i - 1] + arr[i]);
    }
    return arrAcumulativo
}

async function getEstadisticasForDatosSueltos(datosSueltos) {
    //// CALCULO DE DATOS SUELTOS ////
    // Tabla de frecuencias
    const datosOrdenados = datosSueltos.sort((a, b) => a - b); // Ordenar datos
    const numData = datosSueltos.length;
        
    const valorMax = Math.max(... datosOrdenados); 
    const valorMin = Math.min(... datosOrdenados);
    const rango = valorMax - valorMin;

    const marcaClase = [...new Set(datosOrdenados)]; // Obtiene solo los valores únicos
    const frecuencias = marcaClase.map(val => datosOrdenados.filter(x => x === val).length);

    const frecuenciasAbsolutasAcumuladas = await getArrayAcumulativa(frecuencias);

    const frecuenciasRelativas = [];
    for(let i=0; i<frecuencias.length; i++) {
        frecuenciasRelativas.push(frecuencias[i]/numData);
    }
    const frecuenciasRelativasAcumuladas = await getArrayAcumulativa(frecuenciasRelativas);
    const frecuenciaPorcentual = [];
    for(let i=0; i < frecuencias.length; i++) {
        frecuenciaPorcentual.push(frecuenciasRelativas[i] * 100);
    }
  
    //// Calculo de promedio
    const sumatoriaDatos = await getSumatoria(datosSueltos);
    const promedio = sumatoriaDatos.total/numData;
    
    //// Calculo de la mediana
    const medianaIndex = Math.floor((numData - 1)/2);
    const mediana = (numData % 2 === 0)
        ? (datosSueltos[medianaIndex] + datosSueltos[medianaIndex + 1]) / 2
        : datosSueltos[medianaIndex];

    const moda = [];
    const maxFrecuencia = Math.max(... frecuencias);
    
    for(const dato in frecuencias) {
        if (frecuencias[dato] == maxFrecuencia) {
            moda.push(Number(marcaClase[dato]));
        }
    }

    ////Varianza
    const sumatoriaVarianza = await getSumatoria(
        datosSueltos,
        (dato) => {
            return `(${dato} - \\bar{x})^{2}`
        },
        (dato) => {
            return Math.pow((dato - promedio), 2)
        }
    );
    sumatoriaVarianza.numDatos = numData;
    const varianzaPoblacion = sumatoriaVarianza.total/(numData);
    const varianzaMuestra = sumatoriaVarianza.total/(numData - 1);

    ////Desviacion Estandar
    const desviacionEstandarPoblacion = Math.sqrt(varianzaPoblacion);
    const desviacionEstandarMuestra = Math.sqrt(varianzaMuestra);

    /// Coeficiente de Variación (CV)
    const coeficienteVaricionPoblacion =  ((desviacionEstandarPoblacion) / promedio) * 100;
    const coeficienteVaricionMuestra =  ((desviacionEstandarMuestra) / promedio) * 100;
    
    ////Desviacion Media
    const sumatoriaDesviacionMedia = await getSumatoria(
        datosSueltos,
        (dato) => {
            return `|${dato} - \\bar{x}|`
        },
        (dato) => {
            return Math.abs(dato - promedio);
        }
    )
    sumatoriaDesviacionMedia.numDatos = numData;
    const desviacionMedia = sumatoriaDesviacionMedia.total/numData;
  
    return {
        // PARA DATOS SUELTOS A DATOS SUELTOS
        datosOrdenados: datosOrdenados,

        tablaFrecuencias: {
            marcasClase: marcaClase,
            
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
                firstMedianaIndex: medianaIndex
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

async function getEstadisticasForDatosAgrupados(datosSueltos) {
    const datosOrdenados = datosSueltos.sort((a, b) => a - b); // Ordenar datos

    const numData = datosOrdenados.length;
    const valorMax = Math.max(... datosOrdenados); 
    const valorMin = Math.min(... datosOrdenados);
    const rango = valorMax - valorMin;

    const sturgesFormula = 1 + (3.322 * (Math.log10(numData)));
    const hasDecimals = datosOrdenados.some(num => num % 1 !== 0)
    const numIntervalos = hasDecimals?
            sturgesFormula : Math.ceil(sturgesFormula)
    const amplitud = Math.ceil(rango / numIntervalos);
    //// Agrupar las clases 
    // Array de cada intervalo
    const intervalos = [];
    for (let i=valorMin; i<valorMax; i+=amplitud) {
        intervalos.push([i, i+amplitud]);
    }
    
    // Marcas de clase
    const marcasClase = [];
    for (let i=valorMin; i<valorMax; i+=amplitud) {
        marcasClase.push((i+ (i+amplitud) )/2)
    }

    // Frecuencias absolutas 
    const frecuencias = [];
    intervalos.forEach((interval) => {
        const li = interval[0];
        const ls = interval[1];
        
        const index = frecuencias.push(0) - 1;
        datosOrdenados.forEach(dato => {
            if (dato >= li && dato < ls) {
                frecuencias[index] += 1;
            } 
            else if((index == intervalos.length - 1) && (dato >= li && dato <= ls)) {
                frecuencias[index] += 1;
            }
        })
    })

    // frecuencias absolutas acumuladas
    const frecuenciasAbsolutasAcumuladas = await getArrayAcumulativa(frecuencias);

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
            break;
        }
    }

    let mediana;

    const medianaIntervalo = intervalos[claseIndex];
    const medianali = medianaIntervalo[0];
    const lastMedianaFi = frecuenciasAbsolutasAcumuladas[claseIndex - 1] !== undefined?
    frecuenciasAbsolutasAcumuladas[claseIndex - 1] : 0;

    const medianaFrecuenciaClase = frecuencias[claseIndex];

    if (medianaIndex == frecuenciasAbsolutasAcumuladas[claseIndex]) {
        mediana = medianaIntervalo[1]; // Es el limite superior
    } else {
        mediana = medianali + ((((numData/2) - lastMedianaFi) / medianaFrecuenciaClase)) * amplitud;
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

    const modali = intervalos[modaClaseIndex][0];
    const frecuenciaModa = maxFrecuencia;

    const lastFrecuenciaModa = frecuencias[modaClaseIndex-1] !==  undefined? 
        frecuencias[modaClaseIndex - 1] : 0;

    const nextFrecuenciaModa = frecuencias[modaClaseIndex+1] !==  undefined?
        frecuencias[modaClaseIndex + 1] : 0;

    const moda = (modali) + ( ((frecuenciaModa - lastFrecuenciaModa)/( (frecuenciaModa - lastFrecuenciaModa) + (frecuenciaModa - nextFrecuenciaModa) )) * amplitud );

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
        datosOrdenados: datosOrdenados,
        datosAgrupados:true,
        
        valorMax: valorMax,
        valorMin: valorMin,
        rango: rango,
        
        sturges:{
            sturgesFormula: sturgesFormula,
            hasDecimals: hasDecimals,
            numIntervalos: numIntervalos
        },
        
        intervalos: intervalos,
        amplitud: amplitud,

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
                amplitud: amplitud
            },
            result: mediana
        },

        moda: {
            data: {
                limiteInferior: modali,
                frecuenciaClase: frecuenciaModa,
                lastFrecuenciaClase: lastFrecuenciaModa,
                nextFrecuenciaClase: nextFrecuenciaModa,
                amplitud: amplitud
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

async function getEstadisticas(datosSueltos) {
    if (datosSueltos.length < 2) {
        return {}
    }
    //// CALCULO DE DATOS SUELTOS A AGRUPAR ////
    if(toAgruparDatos.checked) {
        return await getEstadisticasForDatosAgrupados(datosSueltos)
    }
    return await getEstadisticasForDatosSueltos(datosSueltos);
};

async function createContentintoStatsWrapper(statsWrapper, title, content, opacity) {
    statsWrapper.innerHTML += `
    <section class="operation-wrapper ${opacity?"opacity": ""}">
        <h3 class="operation-title">${title}</h3>
        <section class="operation-content">
            ${content}
        </section>
    </section>
    <hr/>
    `
}

async function createFrecuenciesTable(columnas) {
    let tableContent = ``;
    columnas.forEach((columna) => {    
        tableContent += `
            <div class="column">
                <p>${columna.header}</p>
                ${columna.datos.map(dato => `<p>${dato}</p>`).join("")}
                ${columna.footer?`<p>${columna.footer}</p>`:``}
            </div>
        `
    })
    return tableContent
}

async function createTableAndGetStatsWrapper(columnas) {
    const tableContent = await createFrecuenciesTable(columnas);
    resultados_estadisticos.innerHTML = "";
    resultados_estadisticos.innerHTML += `
        <section id="stats-operations">
            <h2>Resultados estadísticos</h2>
        </section>
    `
    const statsOperation = document.getElementById("stats-operations");
    
    await createContentintoStatsWrapper(
        statsOperation,
        "Tabla de frecuencias",
        `<div id="frecuencies-table">
            ${tableContent}
        </div>` 
    )

    return statsOperation
}

async function setResultados(statsInfo) {
    const datos = statsInfo.datosOrdenados;    
    resultados_estadisticos.innerHTML = "";
    
    // Establecer tabla de frecuencias
    const columnas = 
        statsInfo.datosAgrupados? [
                { header: 'Clases', datos: statsInfo.tablaFrecuencias.intervalos.map(intervalo => `[${intervalo.join(", ")})`), footer:"\\(\\sum\\)"},
                { header: '\\(x_i \\)', datos: statsInfo.tablaFrecuencias.marcasClase },
                { header: '\\(f_i \\)', datos: statsInfo.tablaFrecuencias.frecuencias, footer: (await getSumatoria(statsInfo.tablaFrecuencias.frecuencias)).total},
                { header: '\\(F_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasAbsolutasAcumuladas },
                { header: '\\(fr_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasRelativas.map(xi => xi.toFixed(2)), footer: Math.round((await getSumatoria(statsInfo.tablaFrecuencias.frecuenciasRelativas)).total)},
                { header: '\\(Fr_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasRelativasAcumuladas.map(xi => xi.toFixed(2))},
                { header: '%', datos: statsInfo.tablaFrecuencias.frecuenciaPorcentual.map(fp => `${fp.toFixed(2)}%`), footer: Math.round((await getSumatoria(statsInfo.tablaFrecuencias.frecuenciaPorcentual)).total) + "%" }
            ]: [
                { header: 'Clases', datos: statsInfo.tablaFrecuencias.marcasClase, footer:"\\(\\sum\\)"},
                { header: '\\(f_i \\)', datos: statsInfo.tablaFrecuencias.frecuencias, footer: (await getSumatoria(statsInfo.tablaFrecuencias.frecuencias)).total},
                { header: '\\(F_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasAbsolutasAcumuladas },
                { header: '\\(fr_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasRelativas.map(xi => xi.toFixed(2)), footer: Math.round((await getSumatoria(statsInfo.tablaFrecuencias.frecuenciasRelativas)).total)},
                { header: '\\(Fr_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasRelativasAcumuladas.map(xi => xi.toFixed(2)) },
                { header: '%', datos: statsInfo.tablaFrecuencias.frecuenciaPorcentual.map(fp => `${fp.toFixed(2)}%`), footer: Math.round((await getSumatoria(statsInfo.tablaFrecuencias.frecuenciaPorcentual)).total) + "%"}
            ];

    const statsOperation = await createTableAndGetStatsWrapper(columnas);

    await createContentintoStatsWrapper(
        statsOperation,
        "Promedio \\( \\bar{x} \\)",
        `
            <p class="operation">
                ${
                    statsInfo.datosAgrupados?
                    `\\(\\bar{x} = \\frac{\\sum_{i=1}^{n} (f_i \\cdot x_i)}{n} = `:
                    `\\(\\bar{x} = \\frac{\\sum_{i=1}^{n} x_i}{n} = `
                }
                \\frac{${statsInfo.promedio.data.sum.operation}}{${statsInfo.promedio.data.numDatos}} =
                \\frac{${statsInfo.promedio.data.sum.total}}{${statsInfo.promedio.data.numDatos}} =
                ${statsInfo.promedio.result}\\)
            </p>

            <p>
                El promedio, también conocido como media aritmética, es una medida de 
                tendencia central que representa el valor típico o central de un 
                conjunto de datos.
            </p>
        `
    )

    if (statsInfo.datosAgrupados) {
        // Mediana
        const mediana = statsInfo.mediana;
        createContentintoStatsWrapper(
            statsOperation, 
            "Mediana \\(Me\\)", 
            `
                <p class="operation">
                    \\(Me = l_i + (\\frac{\\frac{n}{2} - F_{i-1}}{f_i}) \\cdot a_i = 

                    ${mediana.data.limiteInferior} + 
                    (\\frac{ \\frac{${mediana.data.numData}}{2} - ${mediana.data.lastMedianaFrecuenciaAcumulada}}
                    {${mediana.data.frecuenciaClase}}) \\cdot (${mediana.data.amplitud}) = 
                    
                    ${mediana.data.limiteInferior} + 
                    (\\frac{${mediana.data.numData/2} - ${mediana.data.lastMedianaFrecuenciaAcumulada}}
                    {${mediana.data.frecuenciaClase}}) \\cdot (${mediana.data.amplitud}) = 

                    ${mediana.data.limiteInferior} + 
                    (\\frac{${(mediana.data.numData/2) - mediana.data.lastMedianaFrecuenciaAcumulada}}
                    {${mediana.data.frecuenciaClase}}) \\cdot (${mediana.data.amplitud}) = 
                    
                    ${mediana.data.limiteInferior} + 
                    (\\frac{${((mediana.data.numData/2) - mediana.data.lastMedianaFrecuenciaAcumulada)*mediana.data.amplitud}}
                    {${mediana.data.frecuenciaClase}}) = ${mediana.result}\\)
                </p>

                <p>
                Es el valor central de los datos, se utiliza una formula especial debido a que analizamos como datos agrupados.
                <span style="font-weight: 600">
                    Si no existe la Frecuencia Absoluta Acumumulada anterior, se deduce que \\(F_{i-1} = 0\\)
                </span>
                </p>
            `
        );

        // Moda
        const moda = statsInfo.moda;
        createContentintoStatsWrapper(
            statsOperation, 
            "Moda \\(Mo\\)", `
                <p class="operation">
                    \\(Mo = l_i + (\\frac{f_i - f_{i-1}}{(f_i - f_{i-1}) + (f_i - f_{i+1})}) \\cdot a_i 
                    = ${moda.data.limiteInferior} + 
                    (\\frac{${moda.data.frecuenciaClase} - ${moda.data.lastFrecuenciaClase}}
                    {(${moda.data.frecuenciaClase} - ${moda.data.lastFrecuenciaClase}) + 
                    (${moda.data.frecuenciaClase} - ${moda.data.nextFrecuenciaClase})}) \\cdot ${moda.data.amplitud}
                    
                    = ${moda.data.limiteInferior} + 
                    (\\frac{${moda.data.frecuenciaClase - moda.data.lastFrecuenciaClase}}
                    {${moda.data.frecuenciaClase - moda.data.lastFrecuenciaClase} + 
                    ${moda.data.frecuenciaClase - moda.data.nextFrecuenciaClase}}) \\cdot ${moda.data.amplitud}
                    
                    = ${moda.data.limiteInferior} + 
                    (\\frac{${moda.data.frecuenciaClase - moda.data.lastFrecuenciaClase}}
                    {${(moda.data.frecuenciaClase - moda.data.lastFrecuenciaClase) + 
                    (moda.data.frecuenciaClase - moda.data.nextFrecuenciaClase)}}) \\cdot ${moda.data.amplitud}
                    
                    = ${moda.data.limiteInferior} + 
                    (\\frac{${(moda.data.frecuenciaClase - moda.data.lastFrecuenciaClase) * moda.data.amplitud}}
                    {${(moda.data.frecuenciaClase - moda.data.lastFrecuenciaClase) + 
                    (moda.data.frecuenciaClase - moda.data.nextFrecuenciaClase)}})
                    
                    = ${moda.result}
                    \\)
                </p>
                <p>
                    La moda es el valor que aparece con mayor frecuencia en un conjunto de datos. 
                    En el caso de datos agrupados en intervalos, 
                    la moda se calcula utilizando una fórmula porque los datos no están 
                    organizados en valores exactos, sino en clases o intervalos. 
                    <span style="font-weight: 600">Aquí se presenta la <u>primera</u> clase modal</span>, si su estudio es multimodal, 
                    se utilza la misma formula de la Mediana para datos agrupados 
                    considerando que los parámetros cambian según su clase.

                    <span style="font-weight: 600">
                        Si no existe la Frecuencia Absoluta anterior, se deduce que \\(f_{i-1} = 0\\) o
                        si no existe la Frecuencia Absoluta siguiente, se deduce que \\(f_{i+1} = 0\\)
                    </span>
                </p>`
        );
    
        
    } else {
        //Mediana
        const medianaInfo = statsInfo.mediana;
        let medianaOperacion = medianaInfo.result;
        if(medianaInfo.data.isPromedio) {
            if (datos) {
                medianaOperacion = `
                    \\frac{${datos[medianaInfo.data.firstMedianaIndex]}+${datos[medianaInfo.data.firstMedianaIndex + 1]}}{2} =
                    \\frac{${datos[medianaInfo.data.firstMedianaIndex] + datos[medianaInfo.data.firstMedianaIndex + 1]}}{2} =
                    ${medianaInfo.result}
                `
            } else {
                medianaOperacion = `
                    \\frac{${medianaInfo.data.firstMediana}+${medianaInfo.data.secondMediana}}{2} =
                    \\frac{${medianaInfo.data.firstMediana + medianaInfo.data.secondMediana}}{2} =
                    ${medianaInfo.result}
                `
            }

        }

        createContentintoStatsWrapper(
            statsOperation, 
            "Mediana \\(Me\\)", `
                <p class="operation">
                    \\(Me = ${medianaOperacion}\\)
                </p>
                <p>Es el valor central de los datos, si el numero de datos es par, 
                se hace un promedio con los 2 numeros centrales, si el numero de datos es impar,
                tan solo se toma el v alor en enmedio </p>`
            );
        
        // Moda
        createContentintoStatsWrapper(
            statsOperation, 
            "Moda \\(Mo\\)", `
                <p class="operation">
                    \\(Mo = ${statsInfo.moda.result.join(",")}\\)
                </p>
                <p>Con \\(fi = ${statsInfo.maxFrecuencia}\\)</p>
                <p>
                    En datos sueltos, la moda se determina directamente observando 
                    el valor que más veces se repite. 
                    Si un conjunto de datos tiene varios valores con la misma máxima frecuencia, 
                    se dice que es <i>multimodal</i> y eso significa que son varias modas.
                </p>`
            );
    }

    // Varianza
    const varianza = statsInfo.varianza;
    const varianzaPoblacion = statsInfo.varianza.poblacion;
    const varianzaMuestra = statsInfo.varianza.muestra;

    await createContentintoStatsWrapper(
        statsOperation,
        "Varianza \\(\\sigma^2\\) y \\(S^2\\)",
        `
            <section>
                <h4 class="sub-operation">Población \\(\\sigma^2\\)</h4>
                <p class="operation">
                    \\(
                        ${statsInfo.datosAgrupados?
                            `\\sigma^2 = \\frac{\\sum_{i=1}^{n} f_i \\cdot (x_i - \\bar{x})^{2}}{n}`:
                            `\\sigma^2 = \\frac{\\sum_{i=1}^{n} (x_i - \\bar{x})^{2}}{n}`
                        }
                        = \\frac{${varianzaPoblacion.data.operation}}{${varianzaPoblacion.data.numDatos}}
                        = \\frac{${varianzaPoblacion.data.total}}{${varianzaPoblacion.data.numDatos}}
                        = ${varianzaPoblacion.result}
                    \\)
                </p>
            </section>

            <section>
                <h4 class="sub-operation">Muestra \\(S^2\\)</h4>
                <p class="operation">
                    \\(
                        ${statsInfo.datosAgrupados?
                            `S^2 = \\frac{\\sum_{i=1}^{n} f_i \\cdot (x_i-\\bar{x})^{2}}{n-1}`:
                            `S^2 = \\frac{\\sum_{i=1}^{n} (x_i-\\bar{x})^{2}}{n-1}`
                        }
                        = \\frac{${varianzaMuestra.data.operation}}{${varianzaMuestra.data.numDatos} - 1}
                        = \\frac{${varianzaMuestra.data.total}}{${varianzaMuestra.data.numDatos - 1}}
                        = ${varianzaMuestra.result}
                    \\)
                </p>
            </section>

            <p>
                La varianza mide la dispersión de un conjunto de datos con respecto a su promedio. Representa el promedio de las diferencias al cuadrado entre cada dato y la media.
            </p>
        `
    )

    // Desviación estandar
    const desviacionEstandar = statsInfo.desviacionEstandar;
    const desviacionEstandarPoblacion = desviacionEstandar.poblacion;
    const desviacionEstandarMuestra = desviacionEstandar.muestra;
    await createContentintoStatsWrapper(
        statsOperation,
        "Desviación Estandar \\(\\sigma\\) y \\(S\\)",
        `
            <section>
                <h4 class="sub-operation">Población \\(\\sigma\\)</h4>
                <p class="operation">
                    \\(
                        ${statsInfo.datosAgrupados?
                            `\\sigma = \\sqrt{ \\frac{\\sum_{i=1}^{n} f_i \\cdot (x_i-\\bar{x})^{2}}{n}}`:
                            `\\sigma = \\sqrt{ \\frac{\\sum_{i=1}^{n} (x_i-\\bar{x})^{2}}{n}}`
                        }
                        = \\sqrt{\\frac{${desviacionEstandarPoblacion.data.operation}}{${desviacionEstandarPoblacion.data.numDatos}}}
                        = \\sqrt{\\frac{${desviacionEstandarPoblacion.data.total}}{${desviacionEstandarPoblacion.data.numDatos}}}
                        = ${desviacionEstandarPoblacion.result}
                    \\)
                </p>
            </section>

            <section>
                <h4 class="sub-operation">Muestra \\(S\\)</h4>
                <p class="operation">
                    \\(
                        ${statsInfo.datosAgrupados?
                            `S = \\sqrt{ \\frac{\\sum_{i=1}^{n} f_i \\cdot (x_i-\\bar{x})^{2}}{n-1}}`:
                            `S = \\sqrt{ \\frac{\\sum_{i=1}^{n} (x_i-\\bar{x})^{2}}{n-1}}`
                        }
                        = \\sqrt{\\frac{${desviacionEstandarMuestra.data.operation}}{${desviacionEstandarMuestra.data.numDatos} - 1}}
                        = \\sqrt{\\frac{${desviacionEstandarMuestra.data.total}}{${desviacionEstandarMuestra.data.numDatos - 1}}}
                        = ${desviacionEstandarMuestra.result}
                    \\)
                </p>
            </section>

            <p>
                La desviación estandar es la raíz cuadrada de la varianza y mide cuánto, 
                en promedio, los datos se alejan del promedio.
            </p>
        `
    )

    // Coeficiente de variación
    const coeficienteVariacion = statsInfo.coeficienteVariacion;
    const cvMuestra = coeficienteVariacion.muestra;
    const cvPoblacion = coeficienteVariacion.poblacion;
    await createContentintoStatsWrapper(
        statsOperation,
        "Coeficiente de Variación \\(C_v\\)",
        `
            <section>
                <h4 class="sub-operation">Población \\(\\sigma\\)</h4>
                <p class="operation">
                    \\(
                        C_v = \\frac{\\sigma}{\\bar{x}}\\cdot 100 =
                        \\frac{${cvPoblacion.data.desviacionEstandar}}{${cvPoblacion.data.promedio}}\\cdot 100 =
                        ${cvPoblacion.data.desviacionEstandar/cvPoblacion.data.promedio}\\cdot 100 =
                        ${cvPoblacion.result.toFixed(3)}\\%
                    \\)
                </p>
            </section>

            <section>
                <h4 class="sub-operation">Muestra \\(S\\)</h4>
                <p class="operation">
                    \\(
                        C_v = \\frac{S}{\\bar{x}}\\cdot 100 =
                        \\frac{${cvMuestra.data.desviacionEstandar}}{${cvMuestra.data.promedio}}\\cdot 100 =
                        ${cvMuestra.data.desviacionEstandar/cvMuestra.data.promedio}\\cdot 100 =
                        ${cvMuestra.result.toFixed(3)}\\%
                    \\)
                </p>
            </section>

            <p>
                El coeficiente de variación es una medida relativa de dispersión 
                que compara la desviación estándar con el promedio, 
                expresándola como un porcentaje.
            </p>
        `
    )

    // Desviación media
    const desviacionMedia = statsInfo.desviacionMedia; 
    await createContentintoStatsWrapper(
        statsOperation,
        "Desviación Media \\(D_{\\bar{x}}\\)",
        `
            <p class="operation">
                \\(${
                    statsInfo.datosAgrupados?
                    `D_{\\bar{x}} = \\frac{\\sum_{i=1}^{n} (f_i \\cdot |x_i - \\bar{x}|)}{n}`:
                    `D_{\\bar{x}} = \\frac{\\sum_{i=1}^{n} |x_i - \\bar{x}|}{n}`}

                    = \\frac{${desviacionMedia.data.operation}}{${desviacionMedia.data.numDatos}}
                    = \\frac{${desviacionMedia.data.total}}{${desviacionMedia.data.numDatos}}
                    = ${desviacionMedia.result}
                \\)
            </p>

            <p>
                La desviación media mide, en promedio, cuánto se desvían los datos respecto 
                al promedio, pero sin elevar al cuadrado las diferencias. 
                Utiliza valores absolutos.
            </p>
        `
    )
    MathJax.typeset();
}

async function setGraphics(statsInfo) {
    console.log(statsInfo);
    resultados_estadisticos.innerHTML += `
        <section id="stats-graphics">
            <h2>Gráficas</h2>
        </section>
    `
    const statsGraphics = document.getElementById("stats-graphics");

    createContentintoStatsWrapper(
        statsGraphics, 
        "Histograma", `
            <canvas class="graphic" id="histogram"></canvas>`
        );
    createContentintoStatsWrapper(
        statsGraphics, 
        "Gráfica de Barras", `
            <canvas class="graphic" id="bar-graphic"><canvas>`
        );
    createContentintoStatsWrapper(
        statsGraphics,
        "Poligono de frecuencias", `
            <canvas class="graphic" id="poligon-graphic"><canvas>`
    )
    createContentintoStatsWrapper(
        statsGraphics, 
        "Gráfica de Sectores", `
            <canvas class="graphic" id="sector-graphic"><canvas>`
        );
    createContentintoStatsWrapper(
        statsGraphics, 
        "Ojiva", `
            <canvas class="graphic" id="ojiva"><canvas>`
        );
    
    const marcasClase = statsInfo.tablaFrecuencias.marcasClase;
    const frecuencias = statsInfo.tablaFrecuencias.frecuencias;

    const barColor = "#4C0080";
    const borderColor = "#6800b0";
    const secondColor = "#14bded";
    
    // Histograma
    new Chart(document.getElementById("histogram").getContext('2d'), {
        type: 'bar',
        data: {
          labels: marcasClase,
          datasets: [{
            label: 'Frecuencias',
            data: frecuencias,
            backgroundColor: barColor, 
            borderColor: borderColor,
            borderWidth: 1,
            barPercentage: 1,
            categoryPercentage: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Frecuencia: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Marcas de Clase'
              },
              grid: {
                display: false
              }
            },
            y: {
              title: {
                display: true,
                text: 'Frecuencia'
              },
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });

    // Gráfica de barras
    new Chart(document.getElementById("bar-graphic").getContext('2d'), {
        type: 'bar',
        data: {
          labels: marcasClase,
          datasets: [{
            label: 'Frecuencias',
            data: frecuencias,
            backgroundColor: barColor,
            borderColor: borderColor,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => `Frecuencia: ${context.raw}`
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Marcas de Clase'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Frecuencia'
              },
              beginAtZero: true
            }
          }
        }
      });

    // Poligono de frecuencias
    new Chart(document.getElementById("poligon-graphic").getContext('2d'), {
        type: 'line',
        data: {
          labels: marcasClase,
          datasets: [{
            label: 'Frecuencias',
            data: frecuencias,
            borderColor: borderColor,
            backgroundColor: barColor,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: secondColor
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Marcas de Clase'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Frecuencia'
              },
              beginAtZero: true
            }
          }
        }
      });

    // Gráfica de sectores
    const pieLabels= statsInfo.intervalos?
        statsInfo.intervalos.map((intervalo)=>`(${intervalo[0]}, ${intervalo[1]}]`):
        statsInfo.tablaFrecuencias.marcasClase

    new Chart(document.getElementById("sector-graphic").getContext('2d'), {
        type: 'pie',
        data: {
          labels: pieLabels,
          datasets: [{
            label: 'Frecuencias',
            data: frecuencias,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => `Frecuencia: ${context.raw}`
              }
            }
          }
        }
      });
    
    new Chart(document.getElementById("ojiva").getContext('2d'), {
        type: 'line',
        data: {
          labels: marcasClase,
          datasets: [{
            label: 'Frecuencia Acumulada',
            data: statsInfo.tablaFrecuencias.frecuenciasAbsolutasAcumuladas,
            borderColor: borderColor,
            backgroundColor: barColor,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: secondColor
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Marcas de Clase'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Frecuencia Acumulada'
              },
              beginAtZero: true
            }
          }
        }
      });
}

async function calcularEstadisticas() {
    splitData = datos_sueltos_input.value.split(',');
    splitData = splitData.filter((data) => data.trim() !== '');

        // Verifica si todos los datos son números válidos
    const datosSueltosInput = [];
    const invalidData = [];

    splitData.forEach((data) => {
    let numero = Number(data);
    if (!isNaN(numero)) {
        datosSueltosInput.push(numero);
    } else {
        invalidData.push(data);
    }
    });

    if(invalidData.length > 0) {
        errorMsg.innerHTML = `Error: Se detectó los siguientes caracterés no validos:
         (${invalidData.join(",")}). Solo escriba numeros y comas ","`;
        
        resultados_estadisticos.innerHTML = ""
        return
    }
    // Convertir todos los datos que estan separadas por comas y convertirlos a Number
    errorMsg.innerHTML = "";
    
    let result = await getEstadisticas(datosSueltosInput); // Obtener todos los datos estadisticos requeridos    
    datos_sueltos_input.value = result.datosOrdenados.join(", ").trim();
    await setResultados(result);
    await setGraphics(result);
}

calcular_button.addEventListener("click", calcularEstadisticas)
datos_sueltos_input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      calcularEstadisticas()
    }
});