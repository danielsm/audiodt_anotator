const { ipcRenderer } = require('electron')
const fs = require('fs')
const glob = require('glob').Glob



document.addEventListener('DOMContentLoaded', function() {
    var save_dir = document.getElementById('fileSelecter');
    var dirPath = document.getElementById("dirPath");
    var begin = document.getElementById('begin');
    var addClass = document.getElementById('addClass');
    
    save_dir.addEventListener('click', () => {
        
        var dir = ipcRenderer.sendSync('show-open-dialog', ""); //[String] Faz uma requisicao ao script principal

        if (dir != undefined) {
            //Caso algum diretorio tenha sido corretamente selecionado
            dirPath.value = dir;
        }
        var path = dir[0]
        console.log(path)
        if (fs.lstatSync(path).isDirectory()) {
            //itera sobre todos os arquivos .wav do diretorio obtido
            glob(path + '/**/*.wav', {}, (err, files) => {
                //Confirma se há arquivos desse formato
                console.log(files)
                if (files.length > 0) {
                    //Envia a lista dos arquivos .wav para o processo principal
                    ipcRenderer.send('toMain', [path, files]);
                    // //Vai para a pagina de informações do diretorio
                    // window.location.replace("../html/infopage.html")
                } else {
                    //Abre um modal informando que nao há arquivos .wav no diretorio
                    // $("#notWAV").modal('show');
                }
            })
        }

    });

    begin.addEventListener('click', () =>  {
        var dtName = document.getElementById('dtName').value;
        var dirPath = document.getElementById('dirPath').value;
        var numClasses = document.getElementById('numClasses').value;
        var dtClasses = document.getElementById('dtClasses').value;
        //debugger
        console.log("Begin..");
        
        //if (dirPath != ''){
            window.location.replace("../html/playlist.html")
        //}
        
    });

    addClass.addEventListener('click', () =>  {
        var dtClasses = document.getElementById('dtClasses').value;
        var addedClasses = document.getElementById('addedClasses');
        

        if (dtClasses != ''){
            var pos = addedClasses.childElementCount;

            var divNova = document.createElement("div");
            divNova.classList.add("row-sm-1");
            divNova.id = "classe" + pos;

            var button = document.createElement("button");
            button.classList.add("btn", "btn-danger","mb-1", "me-2");
            button.type = "button";
            button.id = "buttonClass" + pos;
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg>'
            divNova.appendChild(button);
            
            var text = document.createTextNode(dtClasses);
            divNova.appendChild(text);
            addedClasses.appendChild(divNova)
            document.getElementById('dtClasses').value = "";
            
            button.onclick = () => removeClass(divNova.id);
        }
    });
})

function removeClass(id){
    var el = document.getElementById(id);
    //debugger
    el.remove();
}