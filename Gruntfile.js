module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      'app/public/css/bundle/tt.css': [
        'app/public/css/yui-reset.css',
        'app/public/css/app.css'
      ],
      'app/public/js/bundle/tt.js': [
        'app/public/js/*.js'
      ],
      'app/public/js/bundle/lib.js': [
        'app/public/js/lib/jquery-1.8.3.min.js',
        'app/public/js/lib/jquery-ui-1.9.2.custom.min.js',
        'app/public/js/lib/jquery.*.js',
        'app/public/js/lib/hogan.js',
        'node_modules/marked/lib/marked.js'
      ]
    },
    fingerprint: {
      assets: {
        src: [
          'app/public/js/bundle/*',
          'app/public/css/bundle/*'
        ],
        filename: 'fingerprint'
      }
    },
    hogan: {
      compile: {
        namespace: 'HoganTemplates',
        src: ['app/views/templates/*.html'],
        dest: 'app/public/js/bundle/hoganTemplates.js'
      }
    },
    uglify: {
      dist: {
        src: ['app/public/js/bundle/tt.js'],
        dest: 'app/public/js/bundle/tt.min.js'
      }
    },
    jshint: {
      options: {
        browser: true,
        curly: true,
        eqeqeq: true,
        evil: true,
        forin: true,
        indent: 2,
        jquery: true,
        quotmark: 'single',
        undef: true,
        unused: false,
        trailing: true,
        globals: {
          TT: true,
          Hogan: true,
          HoganTemplates: true
        }
      },
      tt: ['app/public/js/*.js']
    },
    karma: {
      tests: {
        configFile: 'karma.conf.js'
      }
    },
    watch: {
      files: [
        'app/public/css/*',
        'app/public/js/*',
        'app/views/**',
        'test/**'
      ],
      tasks: 'test'
    }
  });

  grunt.registerMultiTask('hogan', 'Pre-compile hogan.js templates', function () {
    var Hogan = require('hogan.js');
    var path = require('path');
    var data = this.data;

    var namespace = data.namespace || 'HoganTemplates';
    var output = 'var ' + namespace + ' = {};';

    grunt.file.expand(data.src).forEach(function (template) {
      var name = path.basename(template, path.extname(template));
      try {
        output += "\n" + namespace + "['" + name + "'] = " +
          Hogan.compile(grunt.file.read(template).toString(), { asString: true }) + ';';
      } catch (error) {
        grunt.log.writeln('Error compiling template ' + name + ' in ' + template);
        throw error;
      }
    });
    grunt.file.write(data.dest, output);
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-fingerprint');
  grunt.loadNpmTasks('grunt-karma');

  // Default task.
  grunt.registerTask('default', ['jshint', 'hogan', 'concat', 'uglify', 'fingerprint']);
  grunt.registerTask('test', ['default']);

};
