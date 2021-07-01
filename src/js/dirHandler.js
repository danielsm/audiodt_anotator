const { ipcRenderer } = require('electron')
const fs = require('fs')
const glob = require('glob').Glob



window.addEventListener('DOMContentLoaded', function() {
    var save_dir = document.getElementById('fileSelecter');
    var dirPath = document.getElementById("dirPath");
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


})