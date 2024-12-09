import PTYPlugin from "../main";
import path from "path";

export default class ConfigManager{
	serverExecutablePath = path.join(this.plugin.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'pty-backend')
	pluginManifestPath = path.join(this.plugin.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'manifest.json')
	constructor(public plugin:PTYPlugin){}

}
