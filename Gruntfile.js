module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/*.js'],
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            js: {
                src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js',
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
                        dest: 'dist/<%= pkg.name %>-latest.js'
                    },
                    {
                        src: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js',
                        dest: 'dist/<%= pkg.name %>-latest.min.js'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['concat', 'uglify', 'copy']);
};

