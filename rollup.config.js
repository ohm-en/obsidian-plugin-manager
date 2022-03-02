import eslint from '@rollup/plugin-eslint';
import copy from "rollup-plugin-copy";
import typescript from '@rollup/plugin-typescript';
//import nodeResolve from "@rollup/plugin-node-resolve";
//import commonjs from "@rollup/plugin-commonjs";

const outDir = "test-vault/.obsidian/plugins/testing-plugin/";

export default {
  input: 'src/main.ts',
  output: {
	dir: "test-vault/.obsidian/plugins/testing-plugin/",
        sourcemap: "inline",
        format: "cjs",
        exports: "default",
  },
  plugins: [
	// TS imports from `tsconfig.json` by default;
    typescript(),
	//// Allows node to resolve third-party modules using the 'Node resolution algorithm';
    //nodeResolve({ browser: true }),
	//// Fixes Module BS;
    //commonjs(),
    eslint({
      /* https://www.npmjs.com/package/@rollup/plugin-eslint */
    }),
    copy({
    	targets: [
		{ src: "manifest.json", dest: outDir },
		{ src: "styles.css", dest: outDir }
	]}),
  ],
  external: [
		'obsidian',
		//'electron',
		//'@codemirror/autocomplete',
		//'@codemirror/closebrackets',
		//'@codemirror/collab',
		//'@codemirror/commands',
		//'@codemirror/comment',
		//'@codemirror/fold',
		//'@codemirror/gutter',
		//'@codemirror/highlight',
		//'@codemirror/history',
		//'@codemirror/language',
		//'@codemirror/lint',
		//'@codemirror/matchbrackets',
		//'@codemirror/panel',
		//'@codemirror/rangeset',
		//'@codemirror/rectangular-selection',
		//'@codemirror/search',
		//'@codemirror/state',
		//'@codemirror/stream-parser',
		//'@codemirror/text',
		//'@codemirror/tooltip',
		//'@codemirror/view',
	]
};
