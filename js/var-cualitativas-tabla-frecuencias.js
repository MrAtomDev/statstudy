const varCualitativasWrapper = document.getElementById("cualitative-vars");
const calcularCualitativesBtn = document.getElementById("cualitative-vars-calcular");
const cualitativesTablaFrecuencias = document.getElementById("cualitatives-table");
const error = document.getElementById("error-msg");

async function getTablaFrecuenciasCualitativas(){
    const columns = document.querySelectorAll("#cualitatives-table .column");
    let error = "";

    const marcasClaseSet = new Set(); // Unicidad
    const marcasClase = Array.from(columns[0].getElementsByTagName("textarea")).map(
        (textarea, index) => {
            const value = textarea.value.trim();
            const tieneNumero = /\d/.test(value); // Detectar numeros
            const soloNumero = /^\d+(\.\d+)?$/.test(value);  // Verificar si el texto es SOLO un número (sin letras ni otros caracteres)
            if (value == "") {
                error = `Error: La marca de clase en la fila ${index + 1} está vacía. Agruegue texto ya que está estudiando variables cualitativas`
            }

            if (tieneNumero && soloNumero) {
                error = `Error: La marca de clase en la fila ${index + 1} es solo el numero ("${value}"). 
                Agruegue texto ya que está estudiando variables cualitativas`;
            }

            if (marcasClaseSet.has(value)) {
                error = `Error: La marca de clase en la fila ${index + 1} ("${value}") está repetida. Las marcas de clase deben ser únicas.`;
            } else {
                marcasClaseSet.add(value); // Agregar al Set para rastrear unicidad
            }
            
            return value;
        }
    );

    if (error !== "") {return {error: error}}

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

    if (error !== "") {return {error: error}}

    return {
        marcasClase: marcasClase,
        frecuencias: frecuencias,
    };
};

async function getEstadisticasCualitativas(tablaFrecuencias) {
    const frecuencias = tablaFrecuencias.frecuencias;
    const marcasClase = tablaFrecuencias.marcasClase;

    // Constuir Tabla de frecuencias
    // Frecuencias Absolutas Acumuladas
    const frecuenciasAbsolutasAcumuladas = await getArrayAcumulativa(frecuencias);

    // Frencuencias Relativas
    const frecuenciasRelativas = [];
    for(let i=0; i<frecuencias.length; i++) {
        frecuenciasRelativas.push(frecuencias[i]/frecuenciasAbsolutasAcumuladas[frecuencias.length - 1]);
    }

    // Frecuencias Relativas Acumuladas
    const frecuenciasRelativasAcumuladas = await getArrayAcumulativa(frecuenciasRelativas);

    // Frecuencia porcentual
    const frecuenciaPorcentual = [];
    for(let i=0; i < frecuencias.length; i++) {
        frecuenciaPorcentual.push(frecuenciasRelativas[i] * 100);
    }

    // Moda
    const maxFrecuencia = Math.max(... tablaFrecuencias.frecuencias);
    const moda = [];
    for (let i=0; i < frecuencias.length; i++) {
        if(frecuencias[i] == maxFrecuencia) {
            moda.push(marcasClase[i]);
        }
    }

    return {
        moda: {result: moda},
        maxFrecuencia: maxFrecuencia,
        tablaFrecuencias: {
            frecuencias: frecuencias,
            marcasClase: marcasClase,

            frecuenciasAbsolutasAcumuladas:frecuenciasAbsolutasAcumuladas,
            frecuenciasRelativas:frecuenciasRelativas,
            frecuenciasRelativasAcumuladas: frecuenciasRelativasAcumuladas,
            frecuenciaPorcentual:frecuenciaPorcentual,
        }
    }
}

async function setEstadisticasCualitativas(statsInfo) {
    const statsOperation = await createTableAndGetStatsWrapper(
        [
            { header: 'Clases', datos: statsInfo.tablaFrecuencias.marcasClase, footer:"\\(\\sum\\)"},
            { header: '\\(f_i \\)', datos: statsInfo.tablaFrecuencias.frecuencias, footer: (await getSumatoria(statsInfo.tablaFrecuencias.frecuencias)).total},
            { header: '\\(F_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasAbsolutasAcumuladas },
            { header: '\\(fr_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasRelativas.map(xi => xi.toFixed(2)), footer: Math.round((await getSumatoria(statsInfo.tablaFrecuencias.frecuenciasRelativas)).total)},
            { header: '\\(Fr_i \\)', datos: statsInfo.tablaFrecuencias.frecuenciasRelativasAcumuladas.map(xi => xi.toFixed(2)) },
            { header: '%', datos: statsInfo.tablaFrecuencias.frecuenciaPorcentual.map(fp => `${fp.toFixed(2)}%`), footer: Math.round((await getSumatoria(statsInfo.tablaFrecuencias.frecuenciaPorcentual)).total) + "%"}
        ]
    );
    await createContentintoStatsWrapper(
        statsOperation,
        "Promedio \\( \\bar{x} \\)",
        `
            <p>El promedio no se puede aplicar a variables cualitativas 
            porque estas no representan valores numéricos ni tienen una escala matemática 
            que permita operaciones como la suma o el promedio.</p>
        `, true // Opacity
    );

    await createContentintoStatsWrapper(
        statsOperation,
        "Mediana \\(Me \\)",
        `
            <p>La mediana no se puede aplicar porque requiere que los datos 
            estén ordenados en una escala numérica para identificar el valor central 
            y aquí usamos variables cualitativas (cualitades, no números).</p>
        `, true // Opacity
    );

    await createContentintoStatsWrapper(
        statsOperation,
        "Moda \\(Mo \\)",
        `
            <p>\\(Mo = ${statsInfo.moda.result.join(",")} \\)</p>
            <p>Con \\(fi = ${statsInfo.maxFrecuencia}\\)</p>
            <p>En datos sueltos, la moda se determina directamente observando 
            el valor que más veces se repite. 
            Si un conjunto de datos tiene varios valores con la misma máxima frecuencia, 
            se dice que es <i>multimodal</i>.</p>
        `
    );

    await createContentintoStatsWrapper(
        statsOperation,
        "Varianza \\(\\sigma^2\\) y \\(S^2\\)",
        `
            <p>La varianza mide la dispersión de los datos respecto a su promedio. 
            Para calcularla, se necesitan valores numéricos, pero las variables cualitativas 
            no representan magnitudes que se puedan sumar o promediar.</p>
        `, true // Opacity
    );
    await createContentintoStatsWrapper(
        statsOperation,
        "Desviación Estandar \\(\\sigma\\) y \\(S\\)",
        `
            <p>La desviación estándar se basa en la raíz cuadrada de la varianza, 
            por lo que comparte el mismo problema: requiere valores numéricos. 
            Sin una escala cuantitativa, no se puede determinar qué tan alejados están 
            los datos del promedio.</p>
        `, true // Opacity
    );

    await createContentintoStatsWrapper(
        statsOperation,
        "Coeficiente de Variación \\(C_v\\)",
        `
            <p>El coeficiente de variación compara la dispersión relativa de los 
            datos dividiendo la desviación estándar entre el promedio. Si no hay un 
            promedio (lo cual no es posible en datos cualitativos), el coeficiente de 
            variación tampoco puede calcularse.</p>
        `, true // Opacity
    );

    await createContentintoStatsWrapper(
        statsOperation,
        "Desviación Media \\(D_{\\bar{x}}\\)",
        `
            <p>La desviación media mide el promedio de las diferencias 
            absolutas respecto al promedio. Como no hay un promedio 
            en variables cualitativas, no se pueden calcular estas diferencias.</p>
        `, true // Opacity
    );

}

async function calcularCualtativesTable() {
    const tablaFrecuencias = await getTablaFrecuenciasCualitativas();
    if (tablaFrecuencias.error) {return error.innerHTML = tablaFrecuencias.error};
    error.innerHTML = ""; 
    
    const statsInfo = await getEstadisticasCualitativas(tablaFrecuencias);
    await setEstadisticasCualitativas(statsInfo);
    MathJax.typeset();
    await setGraphics(statsInfo);
}
calcularCualitativesBtn.addEventListener("click", calcularCualtativesTable);