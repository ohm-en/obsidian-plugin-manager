//External Imports:
// NOTE: Imports directly from `obsidian` should be kept at minimum;
import { Plugin } from 'obsidian';

//Internal Imports:
//	Provides a "wrapper" for `obsidian`;
//	TODO: Transition to NPM package;
import { constructor as Api } from './obsidian-api-wrapper/Obwrap';

//	Provides various funcitons;	
import { constructor as utility } from './utility';

//	Provides all the `onLoad` and `onSave` handlers;
import { constructor as settingHandle } from './settingHandle';

// ObsidianMD runs whatever runs has returned;
// TODO: Reference source-code
// ObsidianMD provides the `app` and `manifest` variables;
// NOTE: `constructor` doesn't follow "spec" standard due to the variables being provided by `obsidian`;
export default function constructor(app, manifest) {
	// Create a new `Plugin` object, which is required, and name it `plugin`;
	const plugin = new Plugin(app, manifest)

	// `plugin` and `app` () are the interfaces to all `obsidian` methods/prototypes/objects;
	// NOTE: `app` and `plugin.app` are congruent;
	
	// TODO: IMPORTANT: New plugins are *only* added as a defualt configuration!;
	const DEFAULT_SETTINGS = {
		pluginArr: Object.keys(app.plugins.manifests)
			.map(function(id) {
				return { pluginID: id, loadType: "normal" }
			}
		),
	}

	// TODO: Figure when `.onload` is ran without the above;
	plugin.onload = async function() {
		const pluginSettings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());

		const { pluginArr } = pluginSettings;
		const util = utility();
		util.loadLazy({ pluginArr });

		const getPluginData = function(key) {
			const arr = app.plugins.manifests;
			return Object.keys(arr).map(
				function(item) {
					return arr[item][key]
			}
			)
		}

		const handler = settingHandle({ plugin, pluginSettings });

		const settingTabTemplate = [{
			headText: "Plugins",
			headSize: "h2",
			settings: [{
				objectList: pluginArr,
				nameL: getPluginData("name"),
				descL: getPluginData("description"),
				fields: [
					{ type: "toggle", onLoad: util.getPluginStatus, onSave: handler.togglePlugin },
					{ type: "dropdown", choices: {0: "Normal", 1: "Lazy"}, onLoad: "loadType", onSave: handler.loadTySetter }
				]
			},
			{
				type: "normal",
				baseObject: pluginSettings.test,
				name: "Test",
				desc: "I am a test",
				fields: [
					{ type: "text", onLoad: "text", onSave: handler.textHandler }
				]
			}]
		}];

		//DESC: Runs the constructor for the `obsidian` Api wrapper;
		//	Returns a froze object containing all available methods;
		const api = Api();

		const settings = api.settings(plugin);

		// Generate the settings tab based from the template;
		settings.createTab({ settingTabTemplate });

  
		const commands = []; // NOTE: arrays are mutable regardless of assignment;
		pluginArr.forEach(
			function(pluginObj) {
				const { pluginID } = pluginObj
				commands.push({
					id: pluginID,
					name: `Toggle ${app.plugins.manifests[pluginID]["name"]}`,
					callback: function() {
						const isEnabled = util.getPluginStatus( { object: pluginObj } )
						if (isEnabled == true) {
							app.plugins.disablePlugin(pluginID)
						} else {
							app.plugins.enablePlugin(pluginID)
						}
					}
				})
			}
		)

		settings.addCommands({ plugin, commands }); 

	}
	return plugin;
}
