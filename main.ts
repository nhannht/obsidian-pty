import {FileSystemAdapter, Plugin} from 'obsidian';
import BlockManager from "./src/BlockManager";
import * as fs from 'fs';
import {exec} from "child_process";
import {ServerConfig} from "./src/global";
import path from "path";
import find from "find-process"
import ConfigManager from "./src/ConfigManager";

export type ObsidianPtySetting = {
	serverExecutablePath: string;
	serverConfigPath: string;
}

export default class PTYPlugin extends Plugin {
	configManager = new ConfigManager(this);
	// settings:ObsidianPtySetting;
	adapter = this.app.vault.adapter as FileSystemAdapter
	blockManager = new BlockManager(this);
	// DEFAULT_SETTING:ObsidianPtySetting = {
	// }

	serverConfigPath = path.join(this.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'server_config.json')

	serverProcess: ReturnType<typeof exec> | null = null;


	createInitConfig = () => {
		let initConfig: ServerConfig[] = [{
			name: 'Bash',
			port: 12345,
			command: 'bash'
		}, {
			name: 'Fish',
			port: 12346,
			command: 'fish'
		}]
		// create file server_config.json
		try {
			fs.writeFileSync(this.serverConfigPath, JSON.stringify(initConfig, null, 2));
			console.log('Initial backend configuration created.');
		} catch (err) {
			console.error(`Error creating initial server configuration: ${err.message}`);
		}

	}


	// async loadSettings(){
	// 	this.settings = Object.assign({},this.DEFAULT_SETTING,await this.loadData())
	// }
	// async saveSettings() {
	// 	await this.saveData(this.settings);
	// }
	killServer() {
		if (this.serverProcess) {
			this.serverProcess.kill();
			console.log('Backend backend stopped.')
		}

	}

	async checkIfAllRequiredPortAreFree() {
		let allPortAreFree = true
		const serverConfig = JSON.parse(fs.readFileSync(this.serverConfigPath, 'utf8'))
		for (const server of serverConfig) {
			allPortAreFree = allPortAreFree && await this.findProcessByPort(server.port) === "0"
		}
		return allPortAreFree
	}


	async findProcessByPort(port: number) {

		let list = await find('port', port)
		if (list.length === 0) {
			return "0" // no process
		} else {
			return list[0]
		}
	}


	async onload() {
		await this.blockManager.registerZenTermBlock()


	}

	onunload() {
		this.app.workspace.off('quit', this.killServer)
	}


}


// class SettingTab extends PluginSettingTab {
// 	plugin:PTYPlugin;
// 	constructor(app:App, plugin:PTYPlugin){
// 		super(app,plugin);
// 		this.plugin = plugin;
// 	}
// 	display(): void {
// 		const {containerEl} = this;
// 		containerEl.empty();
// 		new Setting(containerEl)
// 			.setName("Server executable path")
// 			.setDesc("When your plugin loaded, it will executable this backend, and shut down it when plugin unloaded. By default the plugin will try to download the compiled binary from Github release if the file did not exist, but you can compiled it yourself if you want")
// 			.addText(text => text
// 				.setPlaceholder("Absolute path in your system")
// 				.setValue(this.plugin.settings.serverExecutablePath)
// 				.onChange(async (value)=>{
// 					this.plugin.settings.serverExecutablePath = value;
// 					await this.plugin.saveSettings()
// 				})
//
// 			)
//
// 		new Setting(containerEl)
// 			.setName("Server config path")
// 			.setDesc("Server config path")
// 			.addText(text => text
// 				.setPlaceholder("Absolute path in your system")
// 				.setValue(this.plugin.settings.serverConfigPath)
// 				.onChange(async (value)=>{
// 					this.plugin.settings.serverConfigPath = value;
// 					await this.plugin.saveSettings()
// 				})
//
// 			)
//
//
// 	}
// }
