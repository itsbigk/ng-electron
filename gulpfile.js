var gulp         = require('gulp'),
    childProcess = require('child_process'),
    electron     = require('electron-prebuilt'),
    jetpack      = require('fs-jetpack'),
    usemin       = require('gulp-usemin'),
    uglify       = require('gulp-uglify'),
    projectDir   = jetpack,
    srcDir       = projectDir.cwd('./app'),
    destDir      = projectDir.cwd('./build');

gulp.task('run', function() {
  childProcess.spawn(electron, ['--debug=5858', './app'], { stdio: 'inherit' });
});

// cleaing build directory if it already exists
gulp.task('clean', function(callback) {
  return destDir.dirAsync('.', { empty: true });
});

// copy files to the build directory
gulp.task('copy', ['clean'], function() {
  return projectDir.copyAsync('app', destDir.path(), {
    overwrite: true,
    matching: [
      './node_modules/**/*',
      '**.html',
      '*.css',
      'server.js',
      'package.json'
    ]
  });
});

gulp.task('build', ['copy'], function() {
  return gulp.src('./app/index.html')
  .pipe(usemin({
    js: [uglify()]
  }))
  .pipe(gulp.dest('build/'));
});

// building the windows application
var release_windows = require('./build.windows');
var os = require('os');

gulp.task('build-electron', ['build'], function() {
  switch (os.platform()) {
    case 'darwin':
    // execute the osx build script
    break;
    case 'linux':
    // execute the linux build script
    break;
    case 'win32':
    // execute the windows build script
    return reslease_windows.build()
    break;
  }
});
