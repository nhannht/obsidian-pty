import {FileSystemAdapter, Notice, Plugin} from 'obsidian';
import BlockManager from "./src/BlockManager";
import * as fs from 'fs';
import * as https from 'https';
import {exec} from "child_process";
import {ServerConfig} from "./src/global";
import path from "path";

export default class PTYPlugin extends Plugin {
	blockManager = new BlockManager(this);
	adapter = this.app.vault.adapter as FileSystemAdapter
	serverExecutablePath = path.join(this.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'pty-server');
	serverConfigPath = path.join(this.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'server_config.json');
	serverProcess: ReturnType<typeof exec> | null = null;
	manifestPath = path.join(this.adapter.getBasePath(), '.obsidian', 'plugins', 'obsidian-pty', 'manifest.json');

	readManifestFileData = () => {
		const text = fs.readFileSync(this.manifestPath, 'utf8');
		return JSON.parse(text);
	}

	checkIfBackEndExecutableExist(): boolean {
		try {
			return fs.existsSync(this.serverExecutablePath);
		} catch (err) {
			console.error(`Error checking if executable exists: ${err.message}`);
			return false;
		}
	}
	
	checkIfServerConfigExist = ()=>{
		try {
			return fs.existsSync(this.serverConfigPath);
		} catch (err) {
			console.error(`Error checking if server config exists: ${err.message}`);
			return false;
		}
	}
	
	createInitConfig = ()=>{
		let initConfig:ServerConfig[] = [{
			name:'Bash',
			port:12345,
			command:'bash'
		}, {
			name: 'Fish',
			port: 12346,
			command:'fish'
		}]
		// create file server_config.json
		try {
			fs.writeFileSync(this.serverConfigPath, JSON.stringify(initConfig, null, 2));
			console.log('Initial server configuration created.');
		} catch (err) {
			console.error(`Error creating initial server configuration: ${err.message}`);
		}
		
	}
	
	startBackendServer = ()=> {
		if (!this.checkIfBackEndExecutableExist()){
			new Notice("There is no back end executable, we start to download it",5000)
			this.downloadBackendExecutable()
		}
		if (this.serverProcess) {
			new Notice("For some unknown reason the old process of server still running, now we will kill it.",5000)
			this.serverProcess.kill()
		}
		if (!this.checkIfServerConfigExist()) {
			new Notice("No server configuration found, we will create a simple ones.",5000)
			this.createInitConfig()

		}
		this.serverProcess = exec(this.serverExecutablePath, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error starting server: ${error.message}`);
				return;
			}
			if (stderr) {
				console.error(`Server stderr: ${stderr}`);
				return;
			}
			console.log(`Server stdout: ${stdout}`);
		});
		console.log('Backend server started.');
	}

	downloadFile = (url: string) => {
		https.get(url, (response) => {
			if (response.statusCode === 200) {
				const file = fs.createWriteStream(this.serverExecutablePath);
				response.pipe(file);
				file.on('finish', () => {
					file.close();
					console.log('Download completed.');
					// Set the file as executable
					fs.chmod(this.serverExecutablePath, 0o755, (err) => {
						if (err) {
							console.error(`Error setting file as executable: ${err.message}`);
						} else {
							console.log('File permissions set to executable.');
						}
					});
				});
			} else if (response.statusCode === 302 || response.statusCode === 301) {
				// Follow redirect
				const redirectUrl = response.headers.location;
				if (redirectUrl) {
					console.log(`Redirecting to ${redirectUrl}`);
					this.downloadFile(redirectUrl);
				} else {
					console.error('Redirect location not found.');
				}
			} else {
				console.error(`Failed to download file: ${response.statusCode}`);
			}
		}).on('error', (err) => {
			console.error(`Error: ${err.message}`);
		});
	};


	downloadBackendExecutable = () => {
		const version = this.readManifestFileData().version
		const downloadUrl = `https://github.com/nhannht/obsidian-pty/releases/download/${version}/pty-server`
		console.log(downloadUrl)
		this.downloadFile(downloadUrl)



	}


	async onload() {
		await this.blockManager.registerZenTermBlock()
		//region add download server command
		this.addCommand({
			name: "Download server",
			id: "obsidian-pty-insert-server",
			callback: () => this.downloadBackendExecutable()
		})
		this.startBackendServer()
		//endregion

	}

	onunload() {
		if (this.serverProcess){
			this.serverProcess.kill();
			console.log('Backend server stopped.')
		}
	}


}


