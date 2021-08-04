//Autor: Daniel Moraes
/*  ========================== main.js ================================
 *  Modulos para controlar a vida útil da aplicacao e criar uma janela 
 *  de navegador nativo (Chromium).
 *  Funciona também como intermediário de comunicação entre
 *  os processos.
 *  ===================================================================
*/

// Módulos para controlar a vida do app e criar janelas nativas do navegador
const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
    // Criar a janela do browser
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true, //permite a importação de bibliotecas do Node.js
            contextIsolation: false, //permite que outros Scripts alem deste possa fazer importações
            enableRemoteModule: true //Permite chamadas de dialogo remoto com o sistema operacional
        }
    })

    // e carrega o home.html do app.
    mainWindow.loadFile('./src/html/home.html')

    // Abrir DevTools.
    // mainWindow.webContents.openDevTools()
}

// Este método será chamado quando o Electron terminar inicialização e está pronto para criar janelas do navegador.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // No macOS, é comum recriar uma janela no aplicativo quando o
        // o ícone de encaixe é clicado e não há outras janelas abertas.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

//Encerre quando todas as janelas estiverem fechadas, exceto no macOS. 
//Lá, é comum que os aplicativos e sua barra de menus permaneçam ativos até que o usuário saia explicitamente com Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// Neste arquivo, você pode incluir o resto do processo principal específico do seu aplicativo
// Você também pode colocar eles em arquivos separados e requeridos-as aqui.

/*EVENTOS DE COMUNICAÇÃO ENTRE OS PROCESSOS*/
//inicia vários envento de escuta para definir os valores de variáveis 

// Ao receber um evento 'setListFiles', define as variaveis (path_dir e list_files) com os valores recebidos em args
ipcMain.on("setListFiles", (event, args) => {
    path_dir = args[0]
    list_files = args[1]
});

// Ao receber um evento 'getListFiles', retorna os valores das variáveis definidos em path_dir e list_files
ipcMain.on("getListFiles", (event, args) => {
    event.returnValue = [path_dir, list_files]
});

// Ao receber um evento 'setClasses', define a variável (classes) com o valor recebido em args
ipcMain.on("setClasses", (event, args) => {
    classes = args
});

// Ao receber um evento 'getListFiles', retorna o valor da variável definidos em path_dir e list_files
ipcMain.on("getClasses", (event, args) => {
    event.returnValue = classes
});

// Ao receber um evento 'show-open-dialog', abre a janela de diretório e retorna o caminho do diretório selecionado
ipcMain.on('show-open-dialog', (event, arg) => {
    save_dir = dialog.showOpenDialogSync({
        properties: ['openDirectory'] //Apenas diretorios podem ser enxergados pela janela de dialogo
    });
    event.returnValue = save_dir
})