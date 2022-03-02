// This import appears to be required in the main file for proper function;
import { Plugin } from 'obsidian';

// TODO: Once apiWrapper is released, add default configuration and sample settings tab;
export default class QuickGrab extends Plugin {
	async onload() {
		//const commands = [{
		//	id: "open-files-url",
		//	name: "Open Files URL",
		//	callback: function() {
		//
		//	}
		}];
		// Arrow funtion (`=>`) implies access to `this`;
		//commands.forEach((command) => {
		//	this.addCommand(command);
		//});
	}
}
