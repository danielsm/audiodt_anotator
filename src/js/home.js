const { ipcRenderer } = require('electron')
const fs = require('fs')
const glob = require('glob').Glob


var classes = [];


document.addEventListener('DOMContentLoaded', function() {
    let dtName = document.getElementById('dtName');
    let dirPath = document.getElementById("dirPath");
    let load_dir1 = document.getElementById('fileSelecter');
    let dtClasses = document.getElementById('dtClasses');
    let addClass = document.getElementById('addClass');
    let begin = document.getElementById('begin');
    let carregarBt = document.getElementById("carregar-tab");


    // Formulário de Nova anotação

    // Botão de escolher diretório dos audios
    load_dir1.onclick = () => loadDir();

    begin.addEventListener('click', () =>  {
        //debugger
        localStorage.clear();
        console.log("Begin..");
        if (dtName.value == ""){
            let msg = document.getElementById("nameMsg");
            msg.hidden = false;
            dtName.required = true;
        }
        else{
            let msg = document.getElementById("nameMsg");
            msg.hidden = true;
            dtName.required = false;
        }
        if (dirPath.value == ""){
            let msg = document.getElementById("dirMsg");
            msg.hidden = false;
            dirPath.required = true;
        }
        else{
            let msg = document.getElementById("dirMsg");
            msg.hidden = true;
            dirPath.required = false;
        }
       
        if (classes.length < 1){
            let msg = document.getElementById("classMsg1");
            msg.hidden = false;
            let msg2 = document.getElementById("classMsg2");
            msg2.hidden = true;
            dtClasses.required = true;
        }
        else{
            let msg = document.getElementById("classMsg1");
            msg.hidden = true;
            let msg2 = document.getElementById("classMsg2");
            msg2.hidden = true;
            dtClasses.required = false;
        }
        if (dtName.value != "" && dirPath.value != "" && classes.length > 0){
            ipcRenderer.send('setClasses', classes);
            localStorage.setItem("name",dtName.value);
            localStorage.setItem(dtName.value+"_classes",classes);
            window.location.replace("../html/playlist.html");
        }  
    });

    addClass.addEventListener('click', () =>  {
       
        let addedClasses = document.getElementById('addedClasses');

        if (dtClasses.value != ''){

            classes.push(dtClasses.value);
            var pos = addedClasses.childElementCount;

            var divNova = document.createElement("div");
            divNova.classList.add("row-sm-1");
            divNova.id = "classe" + pos;

            var button = document.createElement("button");
            button.classList.add("btn", "btn-danger","mb-1", "me-2");
            button.type = "button";
            button.id = "buttonClass" + pos;
            button.setAttribute("data-toogle", "tooltip");
            button.setAttribute("data-placement","top");
            button.setAttribute("title","Excluir essa classe");
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg>'
            divNova.appendChild(button);
            
            var text = document.createTextNode(dtClasses.value);
            divNova.appendChild(text);
            addedClasses.appendChild(divNova)
            document.getElementById('dtClasses').value = "";
           
            let msg = document.getElementById("classMsg2");
            msg.hidden = true;
            dtClasses.required = false;

            button.onclick = () => removeClass(divNova.id, text.nodeValue);
        }
        else{
            let msg1 = document.getElementById("classMsg1");
            msg1.hidden = true;
            let msg = document.getElementById("classMsg2");
            msg.hidden = false;
            dtClasses.required = true;
        }
    });

    //Formulário de Carregar Anotação
    carregarBt.addEventListener('click', () =>  {
        
        let nome = localStorage.getItem("name");
        if (nome){
            let recentDiv = document.getElementById("recentes");
            let newD = document.createElement("div");
            newD.classList.add("col-sm-3");
            let bt = document.createElement("button");
            bt.setAttribute("id", nome+"Bt");
            bt.setAttribute("type","button");
            bt.classList.add("btn", "btn-success", "float-start");
            bt.innerText = nome;
        
            newD.appendChild(bt);
            recentDiv.appendChild(newD);
            
            bt.onclick = () =>  loadFromStorage(nome);
        }
    });

    
    
   

})

//remove da interface e do vetor uma classe adicionada anteriormente
function removeClass(id, classe){
    var el = document.getElementById(id);
 
    for (let i=0; i< classes.length;i++){
        if (classes[i] == classe){
            classes.splice(i,1);
        }
    }
    el.remove();
}

function loadFromStorage(nome){
    debugger
    classes = localStorage.getItem(nome+"_classes");
    classes = classes.split(',');
    let path = localStorage.getItem("path");
    let files = localStorage.getItem("files_list");
    files = files.split(',');
    if (classes){

        ipcRenderer.send('setListFiles', [path, files]);
        ipcRenderer.send('setClasses', classes);
        window.location.replace("../html/playlist.html");
    }
}

function loadDir(){
    let dir = ipcRenderer.sendSync('show-open-dialog', ""); //[String] Faz uma requisicao ao script principal

    if (dir != undefined) {
        //Caso algum diretorio tenha sido corretamente selecionado
        dirPath.value = dir;
    }
    let path = dir[0]
    //console.log(path)
    if (fs.lstatSync(path).isDirectory()) {
        //itera sobre todos os arquivos .wav do diretorio obtido
        glob(path + '/**/*.wav', {}, (err, files) => {
            //Confirma se há arquivos desse formato
            //console.log(files)
            if (files.length > 0) {
                //Envia a lista dos arquivos .wav para o processo principal
                console.log(path,files);
                ipcRenderer.send('setListFiles', [path, files]);
                
                // //Vai para a pagina de informações do diretorio
                // window.location.replace("../html/infopage.html")
            } else {
                //Abre um modal informando que nao há arquivos .wav no diretorio
                // $("#notWAV").modal('show');
            }
        })
    }
}