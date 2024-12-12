import PTYPlugin from "../main";
import fs from "fs";
import {downloadFile, ProfileConfig, readJSONFile, ScanResult} from "./global";
import {exec} from "child_process";

export default class ProfileManager {

	constructor(public plugin: PTYPlugin,) {
	}

	public findExecutable() {
		try {
			const existQ = fs.existsSync(this.plugin.configManager.backendExecutablePath);
			if (existQ) {
				// return absolute path
				return this.plugin.configManager.backendExecutablePath;
			}
		} catch (err) {
			console.error(`Error checking if executable exists: ${err.message}`);
			return false;
		}
		return false
	}


	public downloadExecutableServer() {
		const version = readJSONFile(this.plugin.configManager.pluginManifestPath).version
		const downloadUrl = `https://github.com/nhannht/obsidian-pty/releases/download/${version}/pty-server`
		console.log(downloadUrl)
		downloadFile(downloadUrl, this.plugin.configManager.backendExecutablePath)
	}

	public async scanProfileOnPort(port: number): Promise<ScanResult> {
		if (!this.findExecutable()) {
			this.downloadExecutableServer()
		}
		const command = [this.plugin.configManager.backendExecutablePath, "-scan", "-port", port]
		return new Promise((resolve, reject) => {
			exec(command.join(' '), (error, stdout, stderr) => {
				if (error) {
					console.error(`Error executing command: ${error.message}`);
					reject(error.message);
					return;
				}
				if (stderr) {
					console.error(`Standard error: ${stderr}`);
					reject(stderr);
					return;
				}
				console.log(stdout)
				resolve(JSON.parse(stdout));
			});
		});
	}

	public async startProfileIfPortIsFree(profile: ProfileConfig) {
		const result: ScanResult = await this.scanProfileOnPort(profile.port);
		if (result.message && result.message.includes(`Port ${profile.port} is free`)) {
			const command = profile.command
			const port = profile.port
			const name = profile.name
			const shellCommand = [this.plugin.configManager.backendExecutablePath, "-server", "-command", command, "-port", port, "-name", name]
			return new Promise((resolve, reject) => {
				exec(shellCommand.join(' '), (error, stdout, stderr) => {
					if (error) {
						console.error(`Error executing command: ${error.message}`);
						reject(error.message);
						return;
					}
					if (stderr) {
						console.error(`Standard error: ${stderr}`);
						reject(stderr);
						return;
					}
					console.log(stdout)

				});
			});

		} else if (result.status === "busy") {
			if (result.message  && result.process === "nhannht-pty"){
				console.log("Profile already start, do nothing")
			} else {
				console.log("This port is using by other program than nhannht-pty. I will not intefere")
			}
		}


	}

}
