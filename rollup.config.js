import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
    input: 'js/script.js',
    output: {
		file: 'js/script.min.js',
		format: 'umd',
		name: 'drawChart'
    },
    plugins: [
	    resolve(),
	    babel({
			exclude: 'node_modules/**' // only transpile our source code
	    })
	]
};