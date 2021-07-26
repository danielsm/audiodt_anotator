


const { ipcRenderer } = require('electron'); //Importa funcao de comunicacao com o processo principal
var fs = require('fs');                     //Importa sistema de arquivos
var $ = jQuery = require('jquery');         //Importa comandos JQuery
var path = require('path');                 //Importa sistema de arquivos
// commonjs/requirejs
var WaveSurfer = require('wavesurfer.js');
//const mm = require('music-metadata');       //Importa biblioteca obtencao de metadados de audios
var sound = require("sound-play")

var args = ipcRenderer.sendSync('fromMain', ""); //[Array] faz uma chamada ao evento do processo principal para obter o diretorio geral e sua lista de arquivos  
var path_dir = args[0];                          //[String] caminho do diretorio geral
var list_files = args[1];                        //[Array] caminho de todos os arquivos do diretorio princial
delete args

var wavesurfer;         //[Object] Instancia gerenciamento dos audio de referencia'


function player(audios, ws, ct){
    /* Esta funcao produz um player de audio dado um array de caminhos
     * <ATRIBUTOS>
     *      audios: [Array] caminhos dos arquivo
     *      ws:     [Object] Instancia da biblioteca de exibicao
     *      ct:     [Inteiro] indice do audio
     * <RETORNO>
     *      [null]
    */
    ct = 0
    // CARREGA UMA FAIXA DADOS UM INDICE ATUAL
    let setCurrentSong = function(index) {
        audios[ct].classList.remove('active');
        audios[ct].childNodes[1].innerHTML = play_icon;
        ct = index;
        audios[ct].classList.add('active');
        audios[ct].childNodes[1].innerHTML = pause_icon;
        ws.load(audios[ct].attributes.href.nodeValue);
    };

    // CARREGA UM AUDIO DADO EVENTO DE CLICK
    Array.prototype.forEach.call(audios, function(link, index) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (audios[index].classList.contains('active')) {
                //CASO O AUDIO DE ESTEJA CARREGADO e FEITO APENAS UM GERENCIAMENTO DE PLAY E PAUSE
                if (audios[index].classList.contains('pause')) {
                    ws.play();
                    audios[index].childNodes[1].innerHTML = pause_icon;
                    audios[index].classList.remove('pause');
                } else {
                    ws.pause();
                    audios[index].childNodes[1].innerHTML = play_icon;
                    audios[index].classList.add('pause');
                }
                            
            } else {
                //CASO O AUDIO AINDA NAO ESTEJA CARREGADO
                setCurrentSong(index);
            }  
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    //instacia o objeto de vizualizacao do audio de referencia
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'blue',
        progressColor: 'red',
    });
    let play = document.getElementById("play");
    debugger
    play.addEventListener('click', () =>  {
        let audio = document.getElementById("musica");
        audio.play();
    });
});


// document.addEventListener('DOMContentLoaded', function() {
//     console.log("Playlist.."+list_files)
//     debugger
//     let naudio = 9;                                                 //[Inteiro] Define a quantidade de audio aparecerar por vez em uma coluna da pagina
    
//     let beg_pos = 0;                                                //[Inteiro] Indice do primeiro audio na pagina em relacao a lista de todos oa audios
//     let end_pos;                                                    //[Inteiro] Indice do ultimo audio na pagina em relacao a lista de todos oa audios

//     let playlist = document.getElementById('playlist');             //[Objeto] Carrega o elemento de visualizacao da playlist de referencia

//     let npage = document.getElementsByClassName('npage');           //[Objeto] Carrega o elemento de posicao na paginacao

//     let currentPage = 1;                                            //[Inteiro] pagina atual
//     let lastPage = Math.ceil(list_files.length/naudio)

//     npage[0].innerHTML = currentPage+"/"+lastPage;                  //Define o valor da pagina atual no formulario
    

//     if (list_files.length > naudio) {
//         //Valida de o total de arquivos e inferior ao limite de exibicao por vez
//         end_pos = naudio;
//         for (let index = 0; index < naudio; index++) {
//             let audio = document.createElement('div');
//             audio.id = 'audio'+index
//             audio.href = list_files[index]
//             audio.classList.add("list-group-item", "list-group-item-action");
//             audio.innerText = path.parse(list_files[index]).name

//             playlist.appendChild(audio);
//         }

//     }
//     sound.play("D:/Documentos/audios/airport-barcelona-0-0-a.wav")

    

// });


// // Bind controls
// document.addEventListener('DOMContentLoaded', function() {
//     let playPause = document.querySelector('#playPause');
//     playPause.addEventListener('click', function() {
//         wavesurfer.playPause();
//     });

//     // Toggle play/pause text
//     wavesurfer.on('play', function() {
//         document.querySelector('#play').style.display = 'none';
//         document.querySelector('#pause').style.display = '';
//     });
//     wavesurfer.on('pause', function() {
//         document.querySelector('#play').style.display = '';
//         document.querySelector('#pause').style.display = 'none';
//     });

//     // The playlist links
//     let links = document.querySelectorAll('#playlist a');
//     let currentTrack = 0;

//     // Load a track by index and highlight the corresponding link
//     let setCurrentSong = function(index) {
//         links[currentTrack].classList.remove('active');
//         currentTrack = index;
//         links[currentTrack].classList.add('active');
//         wavesurfer.load(links[currentTrack].href);
//     };

//     // Load the track on click
//     Array.prototype.forEach.call(links, function(link, index) {
//         link.addEventListener('click', function(e) {
//             e.preventDefault();
//             setCurrentSong(index);
//         });
//     });

//     // Play on audio load
//     wavesurfer.on('ready', function() {
//         wavesurfer.play();
//     });

//     wavesurfer.on('error', function(e) {
//         console.warn(e);
//     });

//     // Go to the next track on finish
//     wavesurfer.on('finish', function() {
//         setCurrentSong((currentTrack + 1) % links.length);
//     });

//     // Load the first track
//     setCurrentSong(currentTrack);
// });
