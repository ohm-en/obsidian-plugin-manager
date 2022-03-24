export function constructor(spec) { 
	const { app } = global;
	const getPluginStatus = function(spec) {
		const { object } = spec;
		const isEnabled = app.plugins.getPlugin(object.pluginID);
		if (isEnabled === null) {
				return false;
		}
		return true;
	}
	const loadLazy = function(spec) {
		const { pluginArr  } = spec;
		pluginArr.forEach(
			function(item, i, arr) {
				if (item.loadType == 1) {
					app.plugins.enablePlugin([item.pluginID])
					// TODO: Add debugging mode;
					if ( false === "debug" ) {
						console.log(`Loaded ${item.pluginID}`);
					}
				}
			}
		);
	}
	return Object.freeze({
		getPluginStatus,
		loadLazy
	});
}
