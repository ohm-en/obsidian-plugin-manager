'use strict';

var obsidian = require('obsidian');

function constructor(app, manifest) {
	const plugin = new obsidian.Plugin(app, manifest)
    plugin.onload = async function() {
        const pluginStatus = function(pluginId) {
        	return app.plugins.plugins.hasOwnProperty(pluginId);
        }
        const DEFAULT_SETTINGS = {
            pluginArr: function() {
                let array = {}
                Object.keys(app.plugins.manifests).forEach(
                    function(pluginId) {
                        array[pluginId] = { id: pluginId, delay: 0, enabled: pluginStatus(pluginId) }
                    })
                return array
                }(),
        }
        const pluginSettings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
        const pluginListen = {
        	async set(obj, prop, value) {
        	    const nbj = Object.assign({}, obj); nbj[prop] = value;
        	    const { id } = obj;
        	  	if (nbj.enabled) {
        			// If lazy loading disabled
        			if (nbj.delay == 0) { app.plugins.enablePluginAndSave(id); }
        			// If lazy loading newly enabled
        			else if (obj.delay == 0) { app.plugins.disablePluginAndSave(id); app.plugins.enablePlugin(id) }
        			// If lazy loading already enabled
        			else { app.plugins.enablePlugin(id) }
        		}
        		else {
        			app.plugins.disablePluginAndSave(id)
        		 }
        	    Reflect.set(...arguments)
        		await plugin.saveData(pluginSettings);
        	    return true
        	}
        }
        
        const pluginArr = {};
        Object.entries(pluginSettings.pluginArr)
            .forEach(
                function([id, pluginObj]) {
                    pluginArr[id] = new Proxy(pluginObj, pluginListen);
                })
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
        const createToggleCommand = function({id, name}) {
            const obj = {id: `toggle-${id}`,
                        name: `toggle ${name}`,
                        callback: function() {
                                    pluginArr[id].enabled = !pluginArr[id].enabled
                                }
            }
            return obj
        }
        Object.values(app.plugins.manifests)
        	  .map(createToggleCommand)
        	  // `addCommand` needs to be wrapped in a function. I suspect it's accessing local variables?
        	  .map(function(obj) { plugin.addCommand(obj) });
        const blacklist = [
          "obsidian-plugin-manager",
        ]
        const MySettingTab = new obsidian.PluginSettingTab(app, plugin)
        MySettingTab.display = async function() {
          const { containerEl: El } = MySettingTab;
          El.empty();
          Object.entries(app.plugins.manifests).forEach(
            function([id, pluginData], index, arr) {
              if (! pluginArr[id]) {
                pluginArr[id] = { id: id, delay: 0, enabled: pluginStatus(id) }
              }
              const data = pluginArr[id];
              const st = new obsidian.Setting(El)
              const manifest = app.plugins.manifests[id]
              st.setName(manifest.name)
              st.setDesc(manifest.description)
              st.addToggle(
                function(tg) {
                  tg.setValue(pluginStatus(id))
                  tg.onChange(
                    function(value) {
                                    pluginArr[id].enabled = value;
                    })
                })
              // If plugin id on the blacklist, don't allow EU to change load delay; 
              if (! blacklist.includes(id)) {
                st.addText(
                    function(tx) {
                        tx.inputEl.type = "number"
                        const delayInSeconds = (data.delay / 1000).toString()
                        tx.setValue(delayInSeconds)
                        tx.onChange(function(delay) {
                            pluginArr[id].delay = Number(delay * 1000)
                        })
                    }
                )
              } else {
                st.addText(
                    function(tx) {
                        tx.inputEl.type = "text"
                        tx.setPlaceholder("Unavailable")
                    }
                )
              }
            }
          )
        }
        plugin.addSettingTab(MySettingTab);
    }
	return plugin; }
module.exports = constructor;
