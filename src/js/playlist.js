//Autor: Daniel Moraes
/*  ========================== playlist.js ================================
 *  Script para controlar os eventos na página playlist.html de listagem
 *  e anotação dos áudios carregados.
 *  ===================================================================
*/


const { ipcRenderer } = require('electron'); //Importa funcao de comunicacao com o processo principal
const { dialog } = require('electron').remote;
var $ = jQuery = require('jquery');         //Importa comandos JQuery
var path = require('path');                 //Importa sistema de arquivos
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // Importa o criador de CSV


const NOME = localStorage.getItem("name"); // Obtém o nome do dataset do localStorage
var classes = ipcRenderer.sendSync('getClasses', "");  // Recebe as classes do processo principal

var args = ipcRenderer.sendSync('getListFiles', ""); //[Array] faz uma chamada ao evento do processo principal para obter o diretorio geral e sua lista de arquivos  
var path_dir = args[0];                          //[String] caminho do diretorio geral
var list_files = args[1];                        //[Array] caminho de todos os arquivos do diretorio princial
delete args;


// Atualiza dados no localStorage
localStorage.setItem(NOME+"_path", path_dir.toString());
localStorage.setItem(NOME+"_files_list", list_files);

// Cabeçalho do arquivo CSV que será exportado
const csvWriter = createCsvWriter({
    path: 'D:/Documentos/dev/audiodt_anotator/out/' + NOME + '.csv',
    header: [
        { id: 'audio', title: 'src' },
        { id: 'classe', title: 'classe label' },
        { id: 'page_num', title: 'page_num' }
    ]
});
// array com dados anotados
var anotadedData = []

// Controla as ações após o carregamento da página
document.addEventListener('DOMContentLoaded', function () {
    let finalizar = document.getElementById("finalizar");       // Botão para finalizar anotação e exportar CSV
    let pagesize = 8;                                           // Número de áudios por página
    let init_pos = 0;                                           // mantém o index do primeiro elemento em cada página
    let final_pos;                                              // mantém o index do último elemento em cada página
    let playlist = document.getElementById("playlist");         // Div para inclusão do áudios
    let npage = document.getElementsByClassName('npage');       // Exibe o número da página atual 
    let currentPage = 1;                                        // [Inteiro] pagina atual
    let lastPage = Math.ceil(list_files.length / pagesize);     // Mantém o número de páginas total
    localStorage.setItem(NOME+"_numpages", lastPage);           // Salva o total de páginas no localStorage
    npage[0].innerHTML = currentPage + "/" + lastPage;          // Define o valor da pagina atual no formulario


    final_pos = pagesize;
    for (let index = 0; index < pagesize; index++) {
        //cria a linha com label do audio, player e selecter
        let row = document.createElement("div");
        row.classList.add("row", "mb-2");
        //label
        let label = document.createElement("label");
        label.classList.add("col-sm-5", "py-3");
        label.innerText = list_files[index];
        //player
        let audio = document.createElement("audio");
        audio.classList.add("col-sm-4", "my-1");
        audio.setAttribute("controls", "controls");
        audio.setAttribute("id", "audio");
        let source = document.createElement("source");
        source.setAttribute("src", list_files[index]);
        formato = list_files[index].substr(list_files[index].lastIndexOf(".") + 1, 3);
        source.setAttribute("type", "audio/" + formato);
        audio.appendChild(source);
        //selecter
        let newdiv = document.createElement("div");
        newdiv.classList.add("col-sm-2", "p-3");
        let select = document.createElement("select");
        select.classList.add("form-select");
        select.name = "selection";
        select.setAttribute("id", "select" + (index + init_pos));
        for (let i = 0; i < classes.length; i++) {
            let opt = document.createElement("option");
            opt.setAttribute("value", classes[i]);
            opt.innerText = classes[i];
            select.appendChild(opt);
        }
        saving = localStorage.getItem(NOME + "_" + currentPage);
        if (saving) {
            if (saving.includes(select.id)) {
                saving = saving.split(',')
                let idx = saving.findIndex(func => func === select.id)
                select.selectedIndex = saving[idx + 1];
            }
        }
        newdiv.appendChild(select);
        select.onchange = () => pageSave(currentPage);
        //adicionar as tags
        row.appendChild(label);
        row.appendChild(audio);
        row.appendChild(newdiv);
        playlist.appendChild(row);
        let hr = document.createElement("hr");
        hr.classList.add("mt-1");
        playlist.appendChild(hr);
    }


    let prev = document.getElementById("prev")      // Botão de paginacao voltar
    prev.addEventListener('click', function (e) {
        pageSave(currentPage);
        if (currentPage > 1) {
            //Caso nao seja a pagina inicial
            currentPage -= 1;
            npage[0].innerHTML = currentPage + "/" + lastPage;
            playlist.innerHTML = '';
            // Se está saindo da última página, esconder o botão Finalizar
            if (currentPage !== lastPage) {
                finalizar.hidden = true;
            }
            //Define o range de exibicao
            final_pos = init_pos;
            if ((init_pos - pagesize) >= 0) {
                init_pos -= pagesize;
            } else {
                init_pos = 0;
            }

            let currentAudio = list_files.slice(init_pos, final_pos)       //[Array] Lista de caminhos dos audios de referencia em exibicao

            for (let index = 0; index < currentAudio.length; index++) {
                //cria a linha com label do audio, player e selecter
                let row = document.createElement("div");
                row.classList.add("row", "mb-2");
                //label
                let label = document.createElement("label");
                label.classList.add("col-sm-5", "py-3");
                label.innerText = currentAudio[index];
                //player
                let audio = document.createElement("audio");
                audio.classList.add("col-sm-4", "my-1");
                audio.setAttribute("controls", "controls");
                audio.setAttribute("id", "audio");
                let source = document.createElement("source");
                source.setAttribute("src", currentAudio[index]);
                formato = currentAudio[index].substr(currentAudio[index].lastIndexOf(".") + 1, 3);
                source.setAttribute("type", "audio/" + formato);
                audio.appendChild(source);
                //selecter
                let newdiv = document.createElement("div");
                newdiv.classList.add("col-sm-2", "p-3");
                let select = document.createElement("select");
                select.classList.add("form-select", "form-select-sm");
                select.name = "selection";
                select.setAttribute("id", "select" + (index + init_pos));
                for (let i = 0; i < classes.length; i++) {
                    let opt = document.createElement("option");
                    opt.setAttribute("value", classes[i]);
                    opt.innerText = classes[i];
                    select.appendChild(opt);
                }
                saving = localStorage.getItem(NOME + "_" + currentPage);
                if (saving) {
                    if (saving.includes(select.id)) {
                        saving = saving.split(',')
                        let idx = saving.findIndex(func => func === select.id)
                        select.selectedIndex = saving[idx + 1];
                    }
                }
                newdiv.appendChild(select);
                select.onchange = () => pageSave(currentPage);
                //adicionar as tags
                row.appendChild(label);
                row.appendChild(audio);
                row.appendChild(newdiv);
                playlist.appendChild(row);
                let hr = document.createElement("hr");
                hr.classList.add("mt-1");
                playlist.appendChild(hr);
            }
        }
    });

    let next = document.getElementById("next");      //Elemento de paginacao avancar
    next.addEventListener('click', function (e) {
        pageSave(currentPage);
        if (currentPage < lastPage) {
            //Caso nao seja a pagina Final
            currentPage += 1;
            // Se chegou na última página, exibir o botão finalizar
            if (currentPage === lastPage) {
                finalizar.hidden = false;
            }
            npage[0].innerHTML = currentPage + "/" + lastPage;
            playlist.innerHTML = '';

            //Define o range de exibicao
            init_pos = final_pos;
            if (final_pos + pagesize < list_files.length) {
                final_pos += pagesize;
            } else {
                final_pos = list_files.length
            }

            let currentAudio = list_files.slice(init_pos, final_pos)    //[Array] Lista de caminhos dos audios de referencia em exibicao       

            for (let index = 0; index < currentAudio.length; index++) {
                //cria a linha com label do audio, player e selecter
                let row = document.createElement("div");
                row.classList.add("row", "mb-2");
                //label
                let label = document.createElement("label");
                label.classList.add("col-sm-5", "py-3");
                label.innerText = currentAudio[index];
                //player
                let audio = document.createElement("audio");
                audio.classList.add("col-sm-4", "my-1");
                audio.setAttribute("controls", "controls");
                audio.setAttribute("id", "audio");
                let source = document.createElement("source");
                source.setAttribute("src", currentAudio[index]);
                formato = currentAudio[index].substr(currentAudio[index].lastIndexOf(".") + 1, 3);
                source.setAttribute("type", "audio/" + formato);
                audio.appendChild(source);
                //selecter
                let newdiv = document.createElement("div");
                newdiv.classList.add("col-sm-2", "p-3");
                let select = document.createElement("select");
                select.classList.add("form-select", "form-select-sm");
                select.name = "selection";
                select.setAttribute("id", "select" + (index + init_pos));
                for (let i = 0; i < classes.length; i++) {
                    let opt = document.createElement("option");
                    opt.setAttribute("value", classes[i]);
                    opt.innerText = classes[i];
                    select.appendChild(opt);
                }
                saving = localStorage.getItem(NOME + "_" + currentPage);
                if (saving) {
                    if (saving.includes(select.id)) {
                        saving = saving.split(',')
                        let idx = saving.findIndex(func => func === select.id)
                        select.selectedIndex = saving[idx + 1];
                    }
                }
                newdiv.appendChild(select);
                select.onchange = () => pageSave(currentPage);
                //adicionar as tags
                row.appendChild(label);
                row.appendChild(audio);
                row.appendChild(newdiv);
                playlist.appendChild(row);
                let hr = document.createElement("hr");
                hr.classList.add("mt-1");
                playlist.appendChild(hr);
            }
        }

    });

    // Botão para Salvar anotação no localStorage e encaminhar para página inicial
    partial_save = document.getElementById("parcial");
    partial_save.addEventListener('click', function (e) {
        pageSave(currentPage);
        window.location.replace("../html/home.html");
    });

    // Botão para finalizar anotação e salvar arquivo CSV
    finalizar.addEventListener('click', (event) => {
        exportCSV(currentPage);
    });
});

// Função que salva a anotação até a página atual no localStorage 
function pageSave(currentPage) {
    let audios = document.querySelectorAll("#audio"); // pega todos os elementos com id audio
    let selects = document.querySelectorAll("select"); // pega todos os elementos com id select
    let pages_save = []

    for (let i = 0; i < audios.length; i++) {
        let src = audios[i].currentSrc.substr(audios[i].currentSrc.indexOf("D:"));
        pages_save[i] = [src, selects[i].id, selects[i].options.selectedIndex, classes[selects[i].options.selectedIndex]]
    }
    localStorage.setItem(NOME + "_" + currentPage, pages_save)
}

// Função que Salva a anotação até a última página e
function exportCSV(currentPage) {
    let all = ""
    anotadedData = []
    pageSave(currentPage);
    for (let i = 1; i <= currentPage; i++) {
        let pageContent = localStorage.getItem(NOME + "_" + i);
        if (pageContent) {
            all = all + pageContent;
            pageContent = pageContent.split(",");
            //console.log(i, page);
            let idx = 0;
            while (idx < pageContent.length) {
                let source = pageContent[idx];
                idx += 3;
                let label = pageContent[idx];
                idx += 1;
                //console.log(source,label);
                let obj = {
                    audio: source,
                    classe: label,
                    page_num: i
                }
                anotadedData.push(obj);
            }
        }
    }

    //console.log("Exporting", anotadedData);
    csvWriter
        .writeRecords(anotadedData)
        .then(() => console.log('The CSV file was written successfully'));

    $("#csvExport").modal('show');
}


