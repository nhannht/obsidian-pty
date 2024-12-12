import PTYPlugin from "../main";
import path from "path";

export default class ConfigManager{
	backendExecutablePath = path.join(this.plugin.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'nhannht-pty')
	pluginManifestPath = path.join(this.plugin.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'manifest.json')
	constructor(public plugin:PTYPlugin){}

}
