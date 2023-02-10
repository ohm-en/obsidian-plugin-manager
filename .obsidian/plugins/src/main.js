'use strict';

var obsidian = require("obsidian");

function constructor(app, manifest) {
  const plugin = new obsidian.Plugin(app, manifest);
  const pluginArr = {};

  plugin.onload = async function() {
    const pluginStatus = function (pluginId) {
      return app.plugins.plugins.hasOwnProperty(pluginId);
    };
    const savedData = await plugin.loadData();
    const pluginSettings = (savedData ? savedData : {pluginArr: {}});
    const pluginListen = {
      async set(obj, prop, value) {
        const nbj = Object.assign({}, obj);
        nbj[prop] = value;
        const { id } = obj;
        if (nbj.enabled) {
          // If lazy loading disabled
          if (nbj.delay == 0) {
            app.plugins.enablePluginAndSave(id);
          }
          // If lazy loading newly enabled
          else if (obj.delay == 0) {
            app.plugins.disablePluginAndSave(id);
            app.plugins.enablePlugin(id);
          }
          // If lazy loading already enabled
          else {
            app.plugins.enablePlugin(id);
          }
        } else {
          app.plugins.disablePluginAndSave(id);
        }
        Reflect.set(...arguments);
        await plugin.saveData(pluginSettings);
        return true;
      },
    };
    
    // NOTE: `pluginArr` is defined in the above block for access within `onunload`.
    Object.entries(pluginSettings.pluginArr).forEach(function ([id, pluginObj]) {
      pluginArr[id] = new Proxy(pluginObj, pluginListen);
    });
    Object.entries(pluginArr).forEach(
        function([id, data]) {
          if (data.enabled & data.delay > 0) {
            if (pluginStatus(id) == true) {
              app.plugins.disablePluginAndSave(id)
              app.plugins.enablePlugin(id)
            } else {
                setTimeout(
                  function() {
                      app.plugins.enablePlugin(id)
                  }, data.delay)
            }
          }
        }
    );
    const createToggleCommand = function ({ id, name }) {
      const obj = {
        id: `toggle-${id}`,
        name: `toggle ${name}`,
        callback: function () {
          pluginArr[id].enabled = !pluginArr[id].enabled;
        },
      };
      return obj;
    };
    Object.values(app.plugins.manifests)
      .map(createToggleCommand)
      // `addCommand` needs to be wrapped in a function. I suspect it's accessing local variables?
      .map(function (obj) {
        plugin.addCommand(obj);
      });
    const blacklist = ["obsidian-plugin-manager"];
    const MySettingTab = new obsidian.PluginSettingTab(app, plugin);
    MySettingTab.display = async function () {
      const { containerEl: El } = MySettingTab;
      El.empty();
      // The Manifests are listed based on their id instead of their shown name, so we need to sort it in alphabetical order by what the user sees: the name.
      const sortedPlugins = Object.entries(app.plugins.manifests).sort(function (
        a,
        b
      ) {
        const A = a[1].name.toUpperCase();
        const B = b[1].name.toUpperCase();
        return A < B ? -1 : A > B ? 1 : 0;
      });
      sortedPlugins.forEach(function ([id, pluginData], index, arr) {
        if (!pluginArr[id]) {
            pluginSettings.pluginArr[id] = { id: id, delay: 0, enabled: pluginStatus(id) };
            pluginArr[id] = new Proxy(pluginSettings.pluginArr[id], pluginListen);
        }
        const data = pluginArr[id];
        const st = new obsidian.Setting(El);
        const manifest = app.plugins.manifests[id];
        st.setName(manifest.name);
        st.setDesc(manifest.description);
        st.addToggle(function (tg) {
          tg.setValue(pluginStatus(id));
          tg.onChange(function (value) {
            pluginArr[id].enabled = value;
          });
        });
        // If plugin id on the blacklist, don't allow EU to change load delay;
        if (!blacklist.includes(id)) {
          st.addText(function (tx) {
            tx.inputEl.type = "number";
            tx.setPlaceholder("Startup Delay In Seconds");
            const delayInSeconds = (data.delay / 1000).toString();
            tx.setValue(delayInSeconds);
            tx.onChange(function (delay) {
              pluginArr[id].delay = Number(delay * 1000);
            });
          });
        } else {
          st.addText(function (tx) {
            tx.inputEl.type = "text";
            tx.setPlaceholder("Unavailable");
            tx.setDisabled(true);
          });
        }
      });
    };
    plugin.addSettingTab(MySettingTab);
  }

  plugin.onunload = function() {
    if (!app.plugins.enabledPlugins.has("obsidian-plugin-manager")) {
      Object.entries(pluginArr).forEach(function ([id, data]) {
        if (data.enabled & (data.delay > 0)) {
          app.plugins.disablePlugin(id);
          app.plugins.enablePluginAndSave(id);
        }
      });
    }
  }

  return plugin; }
module.exports = constructor;
