const stats_options = {
    group_data: document.getElementById("group-data"),
    no_group_data: document.getElementById("no-group-data")
}
const stats_result = document.getElementById("stats-result");
const no_group_data_form = document.getElementById("no-group-data-form");
const group_data_form = document.getElementById("frecuencies-table-input");
const type_frecuencies_table_input = document.getElementById("type-frecuencies-table-input");
let last_option_selected = stats_options.no_group_data.id;

const select_stat_option = (event) => {
    if (last_option_selected == event.srcElement.id) {
        return
    } 
    stats_result.innerHTML = ""; // Delete information

    if (event.srcElement.id == "group-data") {
        stats_options.group_data.className = "type-stats selected";
        stats_options.no_group_data.className = "type-stats no-selected";
        no_group_data_form.style.display = "none";
        group_data_form.style.display = "block";
    }
    else if (event.srcElement.id == "no-group-data") {
        stats_options.no_group_data.className = "type-stats selected";
        stats_options.group_data.className = "type-stats no-selected";
        no_group_data_form.style.display = "block";
        group_data_form.style.display = "none";
    }

    last_option_selected = event.srcElement.id;
}

stats_options.group_data.addEventListener("click", select_stat_option)
stats_options.no_group_data.addEventListener("click", select_stat_option)

document.addEventListener('DOMContentLoaded', () => {
    const mySelect = document.getElementById('type-frecuencies-table-input');

    mySelect.addEventListener('change', (event) => {
        const selectedOption = event.target.value;
        const allDivOptions = document.querySelectorAll(".type-frecuencies-table");        

        allDivOptions.forEach((element) => {
            element.style = (element.id == selectedOption)? "display: block;": "display: none;"
        })

        stats_result.innerHTML = "";
    });
});

function textareaChanged(event) {
    event.target.innerHTML = event.srcElement.value;
}

function addRow(event) {
    const relativeTable = event.target.parentElement;
    const clases = relativeTable.querySelector('.column:nth-child(1)');
    const frecuencias = relativeTable.querySelector('.column:nth-child(2)');
    

    clases.innerHTML += (relativeTable.id === "grouped-data-table")? 
    `<div class="interval-input">
        <p>[</p>
        <textarea placeholder="Li" oninput="textareaChanged(event)"></textarea>
        <p>,</p>
        <textarea placeholder="Ls" oninput="textareaChanged(event)"></textarea>
        <p>)</p>
    </div>`
    :`<textarea oninput="textareaChanged(event)" placeholder="Nueva clase"></textarea>`;
    frecuencias.innerHTML += `<textarea oninput="textareaChanged(event)" placeholder="Frecuencia"></textarea>`;
    error.innerHTML = "";
}

function deleteRow(event) {
    const relativeTable = event.target.parentElement;
    const clases = relativeTable.querySelector('.column:nth-child(1)');
    const frecuencias = relativeTable.querySelector('.column:nth-child(2)');

    const clasesTextareas = relativeTable.id === "grouped-data-table"?
    Array.from(clases.querySelectorAll(".interval-input"))
    :Array.from(clases.querySelectorAll("textarea"));

    const frecuenciasTextareas = Array.from(frecuencias.querySelectorAll("textarea"));

    if(clasesTextareas.length == 2 && clasesTextareas.length == 2) {
        error.innerHTML = "Error: No puedes eliminar más filas"
        return
    }

    clasesTextareas[clasesTextareas.length - 1].remove();
    frecuenciasTextareas[frecuenciasTextareas.length - 1].remove();
}

document.querySelectorAll('.add-row').forEach((button) => {
    button.addEventListener('click', addRow);
});

document.querySelectorAll('.delete-row').forEach((button) => {
    button.addEventListener('click', deleteRow);
});
