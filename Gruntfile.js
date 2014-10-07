module.exports = function (grunt) {

	// load the task



	grunt.initConfig(
		{
			ts:
			{
				png2ajpg: {
					src: [
						"./ts/**/*.ts"
					],
					reference: "./ts/reference.ts",  // If specified, generate this file that you can use for your reference management
                    html:['./ts/templates/**/*.html'],
					//watch: './ts',                     // If specified, watches this directory for changes, and re-runs the current target
					out:'./build/js/app.js',
					options: {                         // use to override the default options, http://gruntjs.com/configuring-tasks#options
						target: 'es5',                 // 'es3' (default) | 'es5'
						module: 'commonjs',            // 'amd' (default) | 'commonjs'
						sourceMap: false,               // true (default) | false
						declaration: false,            // true | false (default)
						removeComments: true,           // true (default) | false
						fast:"never"
					}
				}
			},
			watch: {
                png2ajpg: {
					files: ['./ts/**/*.ts'],
					tasks: ['ts:png2ajpg']
				}
			}

		});

	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks("grunt-contrib-watch");



	grunt.registerTask("default", ["ts","watch"]);

}