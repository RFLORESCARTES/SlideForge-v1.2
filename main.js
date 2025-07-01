const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Mantener una referencia global del objeto window
let mainWindow;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'), // Icono de la aplicación
    titleBarStyle: 'hiddenInset', // Estilo macOS
    show: false // No mostrar hasta que esté listo
  });

  // Cargar la aplicación
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Mostrar cuando esté listo para prevenir flash visual
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Abrir DevTools en desarrollo
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitido cuando la ventana es cerrada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Este método será llamado cuando Electron haya terminado la inicialización
app.whenReady().then(() => {
  createWindow();
  
  // Crear menú de aplicación para macOS
  createMenu();

  app.on('activate', () => {
    // En macOS es común re-crear una ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  // En macOS es común que las aplicaciones permanezcan activas hasta que el usuario las cierre explícitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Crear menú de aplicación
function createMenu() {
  const template = [
    {
      label: 'SlideForge',
      submenu: [
        {
          label: 'Acerca de SlideForge',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Servicios',
          role: 'services',
          submenu: []
        },
        { type: 'separator' },
        {
          label: 'Ocultar SlideForge',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Ocultar Otros',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Mostrar Todo',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo Proyecto',
          accelerator: 'Command+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'Abrir Archivo',
          accelerator: 'Command+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Documentos', extensions: ['txt', 'md', 'docx'] },
                { name: 'Todos los archivos', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-open-file', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Guardar',
          accelerator: 'Command+S',
          click: () => {
            mainWindow.webContents.send('menu-save');
          }
        },
        {
          label: 'Exportar',
          accelerator: 'Command+E',
          click: () => {
            mainWindow.webContents.send('menu-export');
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        {
          label: 'Deshacer',
          accelerator: 'Command+Z',
          role: 'undo'
        },
        {
          label: 'Rehacer',
          accelerator: 'Shift+Command+Z',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: 'Cortar',
          accelerator: 'Command+X',
          role: 'cut'
        },
        {
          label: 'Copiar',
          accelerator: 'Command+C',
          role: 'copy'
        },
        {
          label: 'Pegar',
          accelerator: 'Command+V',
          role: 'paste'
        },
        {
          label: 'Seleccionar Todo',
          accelerator: 'Command+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'Command+R',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        {
          label: 'Forzar Recarga',
          accelerator: 'Command+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Herramientas de Desarrollador',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom Real',
          accelerator: 'Command+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        },
        {
          label: 'Acercar',
          accelerator: 'Command+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 1);
          }
        },
        {
          label: 'Alejar',
          accelerator: 'Command+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 1);
          }
        },
        { type: 'separator' },
        {
          label: 'Pantalla Completa',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    {
      label: 'Ventana',
      submenu: [
        {
          label: 'Minimizar',
          accelerator: 'Command+M',
          role: 'minimize'
        },
        {
          label: 'Cerrar',
          accelerator: 'Command+W',
          role: 'close'
        },
        { type: 'separator' },
        {
          label: 'Traer Todo al Frente',
          role: 'front'
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de SlideForge',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de SlideForge',
              message: 'SlideForge v1.0.0',
              detail: 'Generador inteligente de presentaciones con IA\n\nDesarrollado con Electron y React\nPowered by OpenAI'
            });
          }
        },
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://github.com/RFLORESCARTES/SlideForge-v1.2');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Manejar eventos IPC
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Archivo de Texto', extensions: ['txt'] },
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Documentos', extensions: ['txt', 'md', 'docx'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });
  return result;
});

// Prevenir navegación no deseada
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});

