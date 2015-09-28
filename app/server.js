var app           = require('app'),             // app module to control application life
    BrowserWindow = require('browser-window'), // create native live browser window
    mainWindow    = null;                     // main window initial value set at null

// quit when all windows of the application are closed
app.on('window-all-closed', function() {
  if(process.platform != 'darwin') {
    app.quit();
  }
});

// called when electron is finished loading
app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  /*
   * load the html file for the app
   * @TODO possibly add es6 string interpolation if it is available in node 4
   */
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // when the main window in closed then change the mainWindow value to null
  mainWindow.on('closed', function() {

    /*
     * multiple windows are stored in an array. if the app supported
     * multiple windows then this would be the place where you would make
     * that specific window's value null
     */
     mainWindow = null;
  });
});
