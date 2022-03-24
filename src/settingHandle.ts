//Specification:
//	Provides multiple handlers for the `saveAt` and `loadAt` variables within the plugins settings tab;
//	Functions are sorted `loadAt` handlers first;

export function constructor(spec) {
	const { plugin, pluginSettings } = spec;
	const { app } = plugin;
	// If enabled, disabled it; vice versa;
	const togglePlugin = function(spec) {
		const { object, value } = spec;
		const { pluginID } = object;
		if (value === true) {
			app.plugins.enablePluginAndSave(pluginID);
		} else if (value === false) {
			app.plugins.disablePluginAndSave(pluginID);
		}

	}
	// Applies changes needed when changing load typpes;
	// Currently only supports `lazy` and `normal` loading;
	const loadTySetter = function(spec) {
		const { object, value } = spec;
		const { pluginID } = object;
		// Only continue if the type has changed;
		if ( object.loadType != value ) {
			// Update the setting;
			object.loadType = value;
			plugin.saveData(pluginSettings);
			if ( value == 1 ) {
				// TODO: Check if only enable will suffice;
				app.plugins.disablePluginAndSave(pluginID);
				app.plugins.enablePlugin(pluginID);
			} else if ( value == 0 ) {
				app.plugins.enablePluginAndSave(pluginID);
			}

		}
	}
	const textHandler = function(spec) {
		const { object, value } = spec;
		object["text"] = value;
		plugin.saveData(pluginSettings);
	}
	return Object.freeze ({
		togglePlugin,
		loadTySetter,
		textHandler
	});
}
