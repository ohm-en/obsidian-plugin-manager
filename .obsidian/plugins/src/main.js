'use strict';

var obsidian = require('obsidian');

function constructor(app, manifest) {
	const plugin = new obsidian.Plugin(app, manifest)
    plugin.onload = async function() {
		const pluginStatus = function(pluginId) {
			return app.plugins.plugins.hasOwnProperty(pluginId);
		}
		const getPluginData = function(key) {
			const arr = app.plugins.manifests;
			return Object.keys(arr).map(
				function(item) {
					return arr[item][key]
				}
			)
		}
		const togglePlugin = async function(id, state) {
			if (state) {
				if (pluginArr[id].delay > 0) {
					app.plugins.enablePlugin(id);
				} else {
					app.plugins.enablePluginAndSave(id);
				}
				pluginArr[id].enabled = true;
				await plugin.saveData(pluginSettings);
			} else {
				app.plugins.disablePluginAndSave(id);
				pluginArr[id].enabled = false;
				await plugin.saveData(pluginSettings);
			}
		}
        const DEFAULT_SETTINGS = {
        	pluginArr: function() {
        	  let array = {}
        	  Object.keys(app.plugins.manifests).forEach(
        		function(pluginId) {
        			array[pluginId] = { delay: "0", enabled: pluginStatus(pluginId) }
        		})
        	  return array
        	}(),
        }
        
        const pluginSettings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
        const { pluginArr } = pluginSettings;
        Object.entries(pluginArr).forEach(
            function([id, data]) {
                if (data.enabled & data.delay > 0) {
                    setTimeout(
                        function() {
                            app.plugins.enablePlugin([id])
                        }, data.delay)
                }
            }
        );
        
        
        const commands = Object.entries(pluginArr).map(
            function([id, data]) {
                return { id: id,
                         name: `Toggle ${app.plugins.manifests[id]["name"]}`,
                         callback:
                            function() {
                            	const desiredState = ! app.plugins.plugins.hasOwnProperty(id);
                            	togglePlugin(id, desiredState, pluginArr[id]);
                            }
                }
            }
        )
        commands.forEach(
            function(command) {
                plugin.addCommand(command);
            })
        
        
        const MySettingTab = new obsidian.PluginSettingTab(app, plugin)
        MySettingTab.display = function() {
        	const { containerEl: El } = MySettingTab;
        	El.empty();
        	Object.entries(pluginArr).forEach(
        		function([id, data], index, arr) {
        			const st = new obsidian.Setting(El)
        			const manifest = app.plugins.manifests[id]
        			st.setName(manifest.name)
        			st.setDesc(manifest.description)
        			st.addToggle(
        				function(tg) {
        					tg.setValue(pluginStatus(id))
        					tg.onChange(
        						function(value) {
        							togglePlugin(id, value, pluginArr[id])
        							console.log(pluginArr)
        						})
        				})
        			st.addText(
        				function(tx) {
        					tx.inputEl.type = "number"
        					tx.setValue(data.delay)
        					tx.onChange(async function(delay) {
        						pluginArr[id]["delay"] = delay
        						await plugin.saveData(pluginSettings)
        						if (app.plugins.enabledPlugins.has(id)) {
        							if (delay > 0) {
        								app.plugins.disablePluginAndSave(id);
        								app.plugins.enablePlugin(id);
        							}
        						} else if (delay == 0) {
        							if (pluginStatus(id) == true) {
        								app.plugins.enablePluginAndSave(id);
        							}
        						}
        						})
        				})
        		}
        	)
        }
        plugin.addSettingTab(MySettingTab);
    }
	return plugin; }
module.exports = constructor;
