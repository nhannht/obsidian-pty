import PTYPlugin from "../main";
import path from "path";
import fs from "fs";
import https from "https";
import {downloadFile, readJSONFile} from "./global";

export default class BackEndManager {

	constructor(public plugin: PTYPlugin,) {}
	public findExecutable(){
		try {
			const existQ = fs.existsSync(this.plugin.configManager.serverExecutablePath);
			if (existQ){
				// return absolute path
				return this.plugin.configManager.serverExecutablePath;
			}
		} catch (err) {
			console.error(`Error checking if executable exists: ${err.message}`);
			return false;
		}
		return false
	}


	public downloadExecutableServer(){
		const version = readJSONFile(this.plugin.configManager.pluginManifestPath).version
		const downloadUrl = `https://github.com/nhannht/obsidian-pty/releases/download/${version}/pty-server`
		console.log(downloadUrl)
		downloadFile(downloadUrl,this.plugin.configManager.serverExecutablePath)
	}

}
