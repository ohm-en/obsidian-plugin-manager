//External Imports;
import { Plugin } from 'obsidian';

//Internal Imports:
import { settingTab } from './plugin/settings';
import { fuzzysuggestmodal } from './modal/FuzzySuggest';
import { raiseError } from './utility/lessAppAPI';

export function constructor() {
	const { app } = global;

	const settings = function(plugin) {
		const createTab = function(spec: any) {
			return plugin.addSettingTab(settingTab(plugin, spec));
		}

		// TODO: Implement TS type for list of `commands`;
		const addCommands = function(spec) {
			const { plugin, commands } = spec;
			// TODO: Uh, this is just dumb... ;
			commands.forEach(
				function(command) {
					plugin.addCommand(command);
				}
			)
			
		}

		return Object.freeze({ 
			createTab,
			addCommands
		});

	}
	// Syntactical sugar;
	const fuzzySuggestModal = function(spec: any): void {
		new fuzzysuggestmodal(app, spec).open();
	}


	// Retrieves and returns the fronmatter from a file in the vault based on file name;
	const getYaml = function(fileName: String) {
		// TODO: Consider case where fileName does not end in `.md`;
		const tFile = app.vault.getAbstractFileByPath(fileName + ".md");
		if (tFile) {
			const frontmatter = app.metadataCache.getFileCache(tFile).frontmatter;
			if (frontmatter) {
				return frontmatter;
			}
			raiseError({ text: `No frontmatter was found in '${fileName}'.` });
		} else {
			raiseError({ text: `File '${fileName}' not found.` });
		}
	}

	// Returns relevant functions for later execution;
	return Object.freeze({
		settings,
		fuzzySuggestModal,
		getYaml,
	});

}
