import { App, PluginSettingTab, Setting, SettingTab, DropdownComponent } from 'obsidian';
import { raiseError } from '../utility/lessAppAPI';

export function settingTab(plugin, spec) {
	const MySettingTab = new PluginSettingTab(global.app, plugin)
	const { settingTabTemplate } = spec;

	MySettingTab.display = function(): void {
		const { containerEl } = MySettingTab;
		containerEl.empty();
		// TODO: Add option for custom funcitonality (along side pre-defined);
		// TODO: Add option for custom `id` values to allow multiple `id`s per `option`;
		settingTabTemplate.forEach(
			function(head) {
				containerEl.createEl(head.headSize, {text: head.headText})
				head.settings.forEach(
					function(settingArr) {
						const context = { containerEl, settingArr }
						if (settingArr.objectList) {
							settingArr.objectList.forEach(
								function(object, i) {
									settingArr["baseObject"] = object
									context.settingArr.name = context.settingArr.nameL[i]
									context.settingArr.desc = context.settingArr.descL[i]
									createSetting(context)
								}
							)
						} else {
							createSetting(context)
						}
					}
				)
			}
		);
	}

	function baseHandler(cb, spec): void {
		const { context, field } = spec;
		const { onLoad, onSave } = field;
		const object = context.settingArr.baseObject;
		if (typeof(onLoad) === "string") {
			cb.setValue(object[onLoad]);
		} else {
			cb.setValue(onLoad({ object }));
		}
		cb.onChange(function(value) { // save the data on change
			onSave({ value, object });
		});
	}

	function createSetting(context) {
		const { containerEl, settingArr } = context;
		const st = new Setting(containerEl);

		// The basics;
		if (settingArr.name) {
			st.setName(settingArr.name)
		}
		if (settingArr.desc) {
			st.setDesc(settingArr.desc)
		}
		// Iterates through the `types` array of settingArr and checks for 'type' matches;
		// This allows consideration of positional "arguments";
		// TODO: Add 'toggles' as a field;
		settingArr.fields.forEach(
			function(field) {
				const { type } = field
				const spec = { context, field }
				if (type == "text") {
					st.addText(function(text) {
						baseHandler(text, spec)
					});
				} 
				else if (type == "toggle") {
					st.addToggle(function(toggle) {
						baseHandler(toggle, spec)
					});
				} 
				else if (type == "button") {
					const { onClick, size, icon, text, tooltip } = field
					const handle = function(st): void {
						if (text) {
							st.setButtonText(text)
						}
						if ( icon ) {
							st.setIcon(icon)
						}
						if ( tooltip ) {
							st.setTooltip(tooltip)
						}
						st.onClick(
							function(clickEvt) {
								onClick(spec)
							}
						);
					};
					if (size == "full") {
						st.addButton(
							function(cb) {
								handle(cb)
							} 
						)
					} 
					else if (size == "mini") {
						st.addExtraButton(
							function(cb) {
								handle(cb)
							}
						)
					}
				} 
				else if (type == "dropdown") {
					st.addDropdown(
						function(dropd) {
							dropd.addOptions(field.choices)
							baseHandler(dropd, spec)
						}
					)
				}
			}
		)
	}
	return MySettingTab;
}
