var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var sprite = require('css-sprite').stream;
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var appConfig = {
  src: 'app/',
  dest: 'dist/'
}

// Handlebar Data and Helpers 
var handlebarsPath = {
  batch: './' + appConfig.src + 'views',
  data: './' + appConfig.src + 'handlebars/data.json',
  helpers: './' + appConfig.src + '/handlebars/helpers'
} 

// Development
// -----------
// Tasks for Development
// ===========

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: appConfig.src
        // proxy: "yourlocal.dev"
    }
  })
})

// Watch for file changes 
gulp.task('watch', function() {
  gulp.watch(appConfig.src + 'scss/{,*/}*.{scss,sass}', ['styles']);
  gulp.watch(appConfig.src + 'js/{,*/}*.js', ['modernizr', reload]);
  gulp.watch(appConfig.src + 'views/**/*.hbs', ['handlebars', reload]);
  gulp.watch(appConfig.src + 'handlebars/**/*.{js,json}', ['handlebars', reload]);
  gulp.watch(appConfig.src + 'images/sprites', ['sprites', 'styles'], reload);
})

// Generates sprites to be used in css
gulp.task('sprites', function() {
  return gulp.src(appConfig.src + 'images/sprites/*.{png,jpg}')
    .pipe(sprite({
      cssPath: '../images',
      name: 'sprite',
      retina: true,
      style: '_sprite.scss',
      prefix: 'sprite',
      processor: 'scss'
    }))
    .pipe($.plumber())

    .pipe($.size({
      title: 'sprites'
    }))
    .pipe($.if('*.png', gulp.dest(appConfig.src + 'images'), gulp.dest(appConfig.src + 'scss')));
})

// Compile sass with libsass
gulp.task('styles', function() {
  // Compile Sass to CSS with LibSass, autoprefixes and creates sourcemaps
  return gulp.src(appConfig.src + 'scss/{,*/}*.{scss,sass}')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: ['app/bower_components'],
      errLogToConsole: true
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe($.sourcemaps.write())
    .pipe($.size({
      title: 'styles'
    }))
    .pipe(gulp.dest(appConfig.src + './css'))
    .pipe($.filter('**/*.css')) // Filtering stream to only css files
    .pipe(reload({
      stream: true
    }));
});

// Compile Handlebars views into HTML views
gulp.task('handlebars', function() {

  // Set compileHandlebar paths and helpers
  // handlebarsOptions = {
  //   batch: appConfig.src + 'views',
  //   helpers: handlebarsHelpers
  // }

  return gulp.src([
      appConfig.src + 'views/*.{hbs,handlebars}',
      "!" + appConfig.src + 'views/head.hbs',
      "!" + appConfig.src + 'views/foot.hbs'
    ])
    .pipe($.plumber())
    .pipe($.compileHandlebars(require(handlebarsPath.data), {
      batch: handlebarsPath.batch,
      helpers: require(handlebarsPath.helpers),
    }))
    .pipe($.rename(function(path) {
      path.extname = '.html';
    }))
    .pipe($.size({
      title: 'handlebars'
    }))
    .pipe(gulp.dest(appConfig.src))
})

// Cleans up all html produced by handlebars task
gulp.task('clean:dev', function() {
  del([appConfig.src + '*.html']);
});

// Generates Modernizr for test cases
// - Temporarily appends to dev because it
//   uses modernizr 3.0.0.alpha. 
//   Bower modernizr latest is 2.8.3
gulp.task('modernizr', function() {
  return gulp.src([
      appConfig.src + 'js/{,*/}*.js',
      '!' + appConfig.src + 'js/modernizr.js'
    ])
    .pipe($.changed(appConfig.src + 'js'))
    .pipe($.modernizr())
    .pipe($.size({
      title: 'modernizr'
    }))
    .pipe(gulp.dest(appConfig.src + 'js'));
});

// Production
// ----------
// Tasks to build for production
// ==========

// Cleans output directory
gulp.task('clean:dist', function() {
  del([appConfig.dest]);
});

gulp.task('html', function() {
  var assets = $.useref.assets();

  return gulp.src(appConfig.src + '*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.uncss({
      html: [appConfig.src + '*.html'],
      ignore: [/.globals/],
    })))
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe($.size({
      title: 'html'
    }))
    .pipe(gulp.dest(appConfig.dest))
});

// Imagemin 
gulp.task('images', function() {
  return gulp.src(appConfig.src + 'images/**/*.{png,jpg,gif}')
    .pipe($.cache($.imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true,
      // multipass: true, 
    })))
    .pipe($.size({
      title: 'images'
    }))
    .pipe(gulp.dest(appConfig.dest + 'images'));
})

// Copy Web Fonts To Dist
gulp.task('fonts', function() {
  return gulp.src(appConfig.src + 'fonts')
    .pipe($.size({
      title: 'fonts'
    }))
    .pipe(gulp.dest(appConfig.dest + 'fonts'));
});

// Tasks
// -----
// Composite tasks to run with the command line
// =====

// gulp - dev server + watch 
gulp.task('default', function(cb) {
  runSequence(['clean:dev', 'sprites'], ['handlebars', 'styles'], 'browserSync', 'watch', cb);
});

// gulp build - Build for production
gulp.task('build', function(cb) {
  runSequence(['clean:dev', 'clean:dist', 'sprites'], ['styles', 'handlebars', 'images', 'fonts'], 'html', cb);
});
