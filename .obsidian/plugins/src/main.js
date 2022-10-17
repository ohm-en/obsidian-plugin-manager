'use strict';

var obsidian = require('obsidian');

function constructor(app, manifest) {
	const plugin = new obsidian.Plugin(app, manifest)

        plugin.onload = async function() {
		  const DEFAULT_SETTINGS = {
		  	pluginArr: function() {
		  	  let array = {}
		  	  Object.keys(app.plugins.manifests).forEach(
		  		function(pluginID) {
		  			array[pluginID] = { delay: "0" }
		  		})
		  	  return array
		  	}(),
		  }
		  
		  const pluginSettings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
		  const { pluginArr } = pluginSettings;
            Object.entries(pluginArr).forEach(
                function([id, data]) {
                    if (data.delay > 0) {
                        setTimeout(
                            function() {
                                app.plugins.enablePlugin([id])
                            }, data.delay)
                    }
                }
            );
            const getPluginStatus = function({ pluginID }) {
            	const isEnabled = app.plugins.getPlugin(pluginID);
            	if (isEnabled === null) {
            			return false;
            	}
            	return true;
            }
            
            const commands = Object.entries(pluginArr).map(
                function([id, data]) {
                    return { id: id,
                             name: `Toggle ${app.plugins.manifests[id]["name"]}`,
                             callback:
                                function() {
                                    const isEnabled = getPluginStatus( { pluginID: id } )
                                    if (isEnabled) {
                                        app.plugins.disablePlugin(id)
                                    } else {
                                        app.plugins.enablePlugin(id)
                                    }
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
            					tg.setValue(getPluginStatus({ pluginID: id }))
            					tg.onChange(
            						function(value) {
            							if (value) {
            							  app.plugins.enablePluginAndSave(id);
            							} else {
            							  app.plugins.disablePluginAndSave(id);
            							}
            						})
            				})
            			st.addText(
            				function(tx) {
            					tx.inputEl.type = "number"
            					tx.setValue(data.delay)
            					tx.onChange(
            						async function(value) {
            						pluginArr[id]["delay"] = value
            						await plugin.saveData(pluginSettings)
            						if ( value === 0 ) {
            							app.plugins.enablePluginAndSave(id);
            						} else {
            							// TODO: Plugin doesn't need to be disbaled & reenabled every time the value is changed;
            							app.plugins.disablePluginAndSave(id);
            							app.plugins.enablePlugin(id);
            						}
            						})
            				})
            		}
            	)
            }
            
            plugin.addSettingTab(MySettingTab);
        }
	return plugin;
}
module.exports = constructor;
