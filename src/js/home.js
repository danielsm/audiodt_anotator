//Autor: Daniel Moraes
/*  ========================== home.js ================================
 *  Script para controlar os eventos na página home.html de formulário
 *  de criação de nova anotação e de carregar anotação recente.
 *  ===================================================================
*/

const { ipcRenderer } = require('electron')  //Importa função de comunicação com o processo principal
const fs = require('fs')                    //Importa sistema de arquivos do javaScript
const glob = require('glob').Glob           //Importa sistema de arquivos recursivo para iteração sobre um diretorio
let $ = jQuery = require('jquery')         //Importa comandos JQuery

var classes = [];


// Controla as ações após o carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    let dtName = document.getElementById('dtName');             // Input do nome do Dataset
    let dirPath = document.getElementById("dirPath");           // Input do caminho do diretório
    let load_dir1 = document.getElementById('fileSelecter');    // Input do botão de seleção do diretório
    let dtClasses = document.getElementById('dtClasses');       // Input das classes desejadas
    let addClass = document.getElementById('addClass');         // Input do botão de adionar nova classe
    let begin = document.getElementById('begin');               // Input do botão de Iniciar anotação
    let carregarBt = document.getElementById("carregar-tab");   // Input do botão de mudar para tab Carregar Anotação


    // TAB 1 - Formulário de Nova anotação

    // Botão de escolher diretório dos audios
    load_dir1.onclick = () => loadDir();

    // Botão de Iniciar Anotação
    // Verificação e Validação das entradas do formulário
    begin.addEventListener('click', () =>  {
        console.log("Begin..");

        // Se o nome do Dataset não foi preenchido, mostra a mensagem de obrigatoriedade
        if (dtName.value == ""){
            let msg = document.getElementById("nameMsg");
            msg.hidden = false;
            dtName.required = true;
        }
        // Se o nome do Dataset foi preenchido, esconde a mensagem de obrigatoriedade
        else{
            let msg = document.getElementById("nameMsg");
            msg.hidden = true;
            dtName.required = false;
        }
        // Se o caminho do diretório não foi selecionado, mostra a mensagem de obrigatoriedade
        if (dirPath.value == ""){
            let msg = document.getElementById("dirMsg");
            msg.hidden = false;
            dirPath.required = true;
        }
        // Se o caminho do diretório foi selecionado, esconde a mensagem de obrigatoriedade
        else{
            let msg = document.getElementById("dirMsg");
            msg.hidden = true;
            dirPath.required = false;
        }
        // Se nenhuma classe foi adicionada, mostrar a mensagem de obrigatoriedade 
        if (classes.length < 1){
            let msg = document.getElementById("classMsg1");
            msg.hidden = false;
            let msg2 = document.getElementById("classMsg2");
            msg2.hidden = true;
            dtClasses.required = true;
        }
        // Se pelo menos 1 classe foi adicionada, escconde a mensagem de obrigatoriedade
        else{
            let msg = document.getElementById("classMsg1");
            msg.hidden = true;
            let msg2 = document.getElementById("classMsg2");
            msg2.hidden = true;
            dtClasses.required = false;
        }
        // Se todos as entradas estão corretas, envia as classes para o processo principal,
        // salva o nome do dataset e as classes no localStorage,
        // encaminha para a página de anotação (playlist.html)
        if (dtName.value != "" && dirPath.value != "" && classes.length > 0){
            ipcRenderer.send('setClasses', classes);
            localStorage.setItem("name",dtName.value);
            localStorage.setItem(dtName.value+"_classes",classes);
            window.location.replace("../html/playlist.html");
        }  
    });

    // Botão de adicionar classes
    addClass.addEventListener('click', () =>  {
       
        let addedClasses = document.getElementById('addedClasses');

        // Se o input não está vazio
        if (dtClasses.value != ''){
            // adiciona a entrada no array de classes,
            classes.push(dtClasses.value);

            // cria uma div para exibição da classe adicionada com um botão para excluí-la
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

            // Chama função para remover a classe 
            button.onclick = () => removeClass(divNova.id, text.nodeValue);
        }
        // Se o input está vazio, mostra a mensagem de String vazia
        else{
            let msg1 = document.getElementById("classMsg1");
            msg1.hidden = true;
            let msg = document.getElementById("classMsg2");
            msg.hidden = false;
            dtClasses.required = true;
        }
    });

    //TAB 2 - Formulário de Carregar Anotação
    carregarBt.addEventListener('click', () =>  {
        
        // Obtém o nome do dataset do localStorage 
        // e cria um botão para carregar a anotação
        let nome = localStorage.getItem("name");
        if (nome){
            let recentDiv = document.getElementById("recentes");
            recentDiv.innerHTML = '';
            let newD = document.createElement("div");
            newD.classList.add("col-sm-3");
            let bt = document.createElement("button");
            bt.setAttribute("id", nome+"Bt");
            bt.setAttribute("type","button");
            bt.classList.add("btn", "btn-success", "float-start");
            bt.innerText = nome;
        
            newD.appendChild(bt);
            recentDiv.appendChild(newD);
            
            // chama a função de carregar do localStorage quando clicar no botão criado
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

// Carrega uma anotação dado o nome do Dataset
function loadFromStorage(nome){
    // Obtem os dados do localStorage (classes, path e files_list)
    classes = localStorage.getItem(nome+"_classes");
    classes = classes.split(',');
    let path = localStorage.getItem(nome+"_path");
    let files = localStorage.getItem(nome+"_files_list");
    files = files.split(',');
    
    if (classes && path && files){
        // Envia os dados para o processo principal e reencaminha para a página de anotação
        ipcRenderer.send('setListFiles', [path, files]);
        ipcRenderer.send('setClasses', classes);
        window.location.replace("../html/playlist.html");
    }
}

// Abre o navegador de diretórios do sistema e permite a seleção de um diretório
function loadDir(){
    let dir = ipcRenderer.sendSync('show-open-dialog', ""); //[String] Faz uma requisicao ao script principal

    if (dir != undefined) {
        //Caso algum diretorio tenha sido corretamente selecionado
        dirPath.value = dir;
    }
    let path = dir[0]
    if (fs.lstatSync(path).isDirectory()) {
        //itera sobre todos os arquivos .wav do diretorio obtido
        glob(path + '/**/*.wav', {}, (err, files) => {
            //Confirma se há arquivos desse formato
            if (files.length > 0) {
                //Envia a lista dos arquivos .wav para o processo principal
                ipcRenderer.send('setListFiles', [path, files]);
            } else {
                //Abre um modal informando que nao há arquivos .wav no diretorio
                $("#notWAV").modal('show');
            }
        })
    }
}