'use-strict';

var Q            = require('q'),
    childProcess = require('child_process'),
    asar         = require('asar'),
    jetpack      = require('fs-jetpack'),
    projectDir,
    buildDir,
    manifest,
    appDir;

function init() {
  // project directory is the root of the application
  projectDir = jetpack;

  // final build location
  buildDir = projectDir.dir('./dist', { empty: true });

  // angular app directory
  appDir = projectDir.dir('./build');

  // angular application's package.json file
  manifest = appDir.read('./package.json', 'json')

  return Q();
}

// change the default dist folder contents in electron's dist folder
function copyElectron() {
  return projectDir.copyAsync('./node_modules/electron-prebuilt/dist', buildDir.path(), { overwrite: true });
}

function cleanupRunTime() {
  return buildDir.removeAsync('resources/default_app');
}

function createAsar() {
  var deferred = Q.defer();

  asar.createPackage(appDir.path(), buildDir.path('resources/app.asar'), function() {
    deferred.resolve();
  });

  return deferred.promise;
}

// replace application resources with your own
function updateResources() {
  var deferred = Q.defer();

  // copy application icon. this example is making the app for windows
  projectDir.copy('resources/windows/icon.ico', buildDir.path('icon.ico'));

  // replace electron icon
  var rcedit = require('rcedit');

  rcedit(buildDir.path('electron.exe'), {
    'icon': projectDir.path('resources/windows/icon.ico'),
    'version-string': {
      'ProductName': manifest.name,
      'FileDescription': manifest.description
    }
  }, function(err) {
    if (!err) {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function rename() {
  return buildDir.renameAsync('electron.exe', manifest.name + '.exe');
}

function createInstaller() {
  var deferred = Q.defer();

  function replace(str, patterns) {
    Object.keys(patterns).forEach(function(pattern) {
      console.log(pattern);

      var matcher = new RegExp('{{' + pattern + '}}', 'g');
      str = str.replace(matcher, patterns[pattern]);
    });

    return str;
  }

  var installScript = replace(installScript, {
    name: manifest.name,
    ProductName: manifest.name,
    version: manifest.version,
    src: buildDir.path(),
    dest: projectDir.path(),
    icon: buildDir.path('icon.ico'),
    setupIcon: buildDir.path('icon.ico'),
    banner: projectDir.path('resources/windows/banner.bmp')
  });

  buildDir.write('installer.msi', installScript);

  var nsis = childProcess.spawn('makensis', [buildDir.path('installer.msi')], {
    stdio: 'inherit'
  });

  nsis.on('error', function(err) {
    if (err.message === 'spawn makensis ENOENT') {
      throw "Can't find NSIS. Are you sure you've installed it and added to the PATH environment variable?";
    } else {
      throw err;
    }
  });

  nsis.on('close', function() {
    deferred.resolve();
  });

  return deferred.promise();
}

// function that will be exported to gulp to build the app
function build() {
  return init()
          .then(copyElectron)
          .then(cleanupRunTime)
          .then(createAsar)
          .then(updateResources)
          .then(rename)
          .then(createInstaller);
}

module.exports = { build: build };
