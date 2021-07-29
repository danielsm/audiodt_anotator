// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true, //permite a importação de bibliotecas do Node.js
            contextIsolation: false, //permite que outros Scripts alem deste possa fazer importações
            enableRemoteModule: true //Permite chamadas de dialogo remoto com o sistema operacional
        }
    })

    // and load the home.html of the app.
    mainWindow.loadFile('./src/html/home.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. Você também pode colocar eles em arquivos separados e requeridos-as aqui.

/*EVENTOS DE COMUNICAÇÃO ENTRE OS PROCESSOS*/
//inicia varios envento de escuta para definir os valores das variaveis 
ipcMain.on("setListFiles", (event, args) => {
	path_dir = args[0]
	list_files = args[1]
});


ipcMain.on("getListFiles", (event, args) => {
	event.returnValue = [path_dir, list_files]
});

ipcMain.on("setClasses", (event, args) => {
	classes = args
});

ipcMain.on("getClasses", (event, args) => {
	event.returnValue = classes
});


ipcMain.on('show-open-dialog', (event, arg) => {
    save_dir = dialog.showOpenDialogSync({
        properties: ['openDirectory'] //Apenas diretorios podem ser enxergados pela janela de dialogo
    });
    event.returnValue = save_dir
})