const { ipcRenderer } = require('electron'); //Importa funcao de comunicacao com o processo principal
var $ = jQuery = require('jquery');         //Importa comandos JQuery
var path = require('path');                 //Importa sistema de arquivos
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


var classes = ipcRenderer.sendSync('getClasses', ""); 
var args = ipcRenderer.sendSync('getListFiles', ""); //[Array] faz uma chamada ao evento do processo principal para obter o diretorio geral e sua lista de arquivos  
var path_dir = args[0];                          //[String] caminho do diretorio geral
var list_files = args[1];                        //[Array] caminho de todos os arquivos do diretorio princial
delete args
console.log(path_dir);

const NOME = localStorage.getItem("name");
localStorage.setItem("path",path_dir.toString());
localStorage.setItem("files_list",list_files);
const csvWriter = createCsvWriter({
    path: 'D:/Documentos/dev/audiodt_anotator/assets/temp/'+NOME+'.csv',
    header: [
      {id: 'audio', title: 'src'},
      {id: 'classe', title: 'classe label'},
      {id: 'page_num', title: 'page_num'}
    ]
  });
var anotadedData = []

document.addEventListener('DOMContentLoaded', function() {
    debugger
    let finalizar = document.getElementById("finalizar");
    let pagesize = 8;
    let init_pos = 0;
    let final_pos;
    let playlist = document.getElementById("playlist");
    let npage = document.getElementsByClassName('npage'); 
    let currentPage = 1;                                            //[Inteiro] pagina atual
    let lastPage = Math.ceil(list_files.length/pagesize)
    localStorage.setItem("numpages", lastPage);
    npage[0].innerHTML = currentPage+"/"+lastPage;                  //Define o valor da pagina atual no formulario

  
    final_pos = pagesize;
    for (let index = 0; index < pagesize; index++){
        //cria a linha com label do audio, player e selecter
        let row = document.createElement("div");
        row.classList.add("row", "mb-2");
        //label
        let label = document.createElement("label");
        label.classList.add("col-sm-5",  "py-3");
        label.innerText = list_files[index];
        //player
        let audio = document.createElement("audio");
        audio.classList.add("col-sm-4", "my-1");
        audio.setAttribute("controls", "controls");
        audio.setAttribute("id", "audio");
        let source = document.createElement("source");
        source.setAttribute("src", list_files[index]);
        formato = list_files[index].substr(list_files[index].lastIndexOf(".")+1,3);
        source.setAttribute("type","audio/"+formato);
        audio.appendChild(source);
        //selecter
        let newdiv = document.createElement("div");
        newdiv.classList.add("col-sm-2", "p-3");
        let select = document.createElement("select");
        select.classList.add("form-select");
        select.name = "selection";
        select.setAttribute("id", "select"+(index+init_pos));
        for (let i=0;i<classes.length;i++){
            let opt = document.createElement("option");
            opt.setAttribute("value",classes[i]);
            opt.innerText = classes[i];
            select.appendChild(opt);
        }
        saving = localStorage.getItem(NOME+"_"+currentPage);
        if (saving){
            if (saving.includes(select.id)){
                saving = saving.split(',')
                let idx = saving.findIndex(func => func === select.id)
                select.selectedIndex = saving[idx+1];
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
    
    
    let prev = document.getElementById("prev")      //Elemento de paginacao voltar
    prev.addEventListener('click', function(e) {    
        pageSave(currentPage);
        if (currentPage > 1) {
            //Caso nao seja a pagina inicial
            currentPage -= 1;
            npage[0].innerHTML = currentPage+"/"+lastPage;
            playlist.innerHTML = '';
            if (currentPage !== lastPage){
                finalizar.hidden = true;
            }
            //Define o range de exibicao
            final_pos = init_pos;
            if ((init_pos - pagesize) >= 0) {
                init_pos -= pagesize;
            } else {
                init_pos = 0;
            }

            let currentAudio = list_files.slice(init_pos, final_pos)                       //[Array] Lista de caminhos dos audios de referencia em exibicao

            for (let index = 0; index < currentAudio.length; index++) {
                //cria a linha com label do audio, player e selecter
                let row = document.createElement("div");
                row.classList.add("row", "mb-2");
                //label
                let label = document.createElement("label");
                label.classList.add("col-sm-5",  "py-3");
                label.innerText = currentAudio[index];
                //player
                let audio = document.createElement("audio");
                audio.classList.add("col-sm-4", "my-1");
                audio.setAttribute("controls", "controls");
                audio.setAttribute("id", "audio");
                let source = document.createElement("source");
                source.setAttribute("src", currentAudio[index]);
                formato = currentAudio[index].substr(currentAudio[index].lastIndexOf(".")+1,3);
                source.setAttribute("type","audio/"+formato);
                audio.appendChild(source);
                //selecter
                let newdiv = document.createElement("div");
                newdiv.classList.add("col-sm-2", "p-3");
                let select = document.createElement("select");
                select.classList.add("form-select", "form-select-sm");
                select.name = "selection";
                select.setAttribute("id", "select"+(index+init_pos));
                for (let i=0;i<classes.length;i++){
                    let opt = document.createElement("option");
                    opt.setAttribute("value",classes[i]);
                    opt.innerText = classes[i];
                    select.appendChild(opt);
                }
                saving = localStorage.getItem(NOME+"_"+currentPage);
                if (saving){
                    if (saving.includes(select.id)){
                        saving = saving.split(',')
                        let idx = saving.findIndex(func => func === select.id)
                        select.selectedIndex = saving[idx+1];
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
    next.addEventListener('click', function(e) {
        pageSave(currentPage);
        if (currentPage < lastPage) {
            //Caso nao seja a pagina Final
            currentPage += 1;
            if (currentPage === lastPage){
                finalizar.hidden = false;
            }
            npage[0].innerHTML = currentPage+"/"+lastPage;
            playlist.innerHTML = '';
           
            //Define o range de exibicao
            init_pos = final_pos;
            if (final_pos+pagesize < list_files.length) {
                final_pos += pagesize;
            } else {
                final_pos = list_files.length
            }

            let currentAudio = list_files.slice(init_pos, final_pos)                       //[Array] Lista de caminhos dos audios de referencia em exibicao       
            
            for (let index = 0; index < currentAudio.length; index++) {
                //cria a linha com label do audio, player e selecter
                let row = document.createElement("div");
                row.classList.add("row", "mb-2");
                //label
                let label = document.createElement("label");
                label.classList.add("col-sm-5",  "py-3");
                label.innerText = currentAudio[index];
                //player
                let audio = document.createElement("audio");
                audio.classList.add("col-sm-4", "my-1");
                audio.setAttribute("controls", "controls");
                audio.setAttribute("id", "audio");
                let source = document.createElement("source");
                source.setAttribute("src", currentAudio[index]);
                formato = currentAudio[index].substr(currentAudio[index].lastIndexOf(".")+1,3);
                source.setAttribute("type","audio/"+formato);
                audio.appendChild(source);
                //selecter
                let newdiv = document.createElement("div");
                newdiv.classList.add("col-sm-2", "p-3");
                let select = document.createElement("select");
                select.classList.add("form-select", "form-select-sm");
                select.name = "selection";
                select.setAttribute("id", "select"+(index+init_pos));
                for (let i=0;i<classes.length;i++){
                    let opt = document.createElement("option");
                    opt.setAttribute("value",classes[i]);
                    opt.innerText = classes[i];
                    select.appendChild(opt);
                }
                saving = localStorage.getItem(NOME+"_"+currentPage);
                if (saving){
                    if (saving.includes(select.id)){
                        saving = saving.split(',')
                        let idx = saving.findIndex(func => func === select.id)
                        select.selectedIndex = saving[idx+1];
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
    
    partial_save = document.getElementById("parcial");
    partial_save.onclick = () => pageSave(currentPage);
    finalizar.onclick =  () => exportCSV(currentPage);
});


function exportCSV(currentPage){
    debugger
    let all = ""
    anotadedData = []
    pageSave(currentPage);
    for (let i=1; i<=currentPage;i++){ 
        let pageContent = localStorage.getItem(NOME+"_"+i);
        if (pageContent){
            all = all + pageContent;
            pageContent = pageContent.split(",");
            //console.log(i, page);
            let idx = 0;
            while (idx < pageContent.length){
                let source = pageContent[idx];
                idx+=3;
                let label = pageContent[idx];
                idx+=1;
                //console.log(source,label);
                let obj = {
                    audio: source,
                    classe: label,
                    page_num:  i
                }
                anotadedData.push(obj);
            }     
        }
    }

    console.log("Exporting", anotadedData);
    csvWriter
        .writeRecords(anotadedData)
        .then(()=> console.log('The CSV file was written successfully'));
}

function pageSave(currentPage){
    let audios = document.querySelectorAll("#audio"); // pega todos os elementos com id audio
    let selects = document.querySelectorAll("select"); // pega todos os elementos com id select
    let pages_save = []
    
    for (let i=0;i < audios.length;i++){
        let src = audios[i].currentSrc.substr(audios[i].currentSrc.indexOf("D:"));
        //console.log(src); 
        pages_save[i] = [src,selects[i].id, selects[i].options.selectedIndex, classes[selects[i].options.selectedIndex] ]
        // console.log(pages_save[i]);
    }
    //console.log(pages_save);
    localStorage.setItem(NOME+"_"+currentPage, pages_save)
}
