import {App, Editor, FileSystemAdapter, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import BlockManager from "./src/BlockManager";
import "@xterm/xterm/css/xterm.css";
import {exec} from "child_process";
import {ChildProcess} from "node:child_process";

// Remember to rename these classes and interfaces!


export default class ZenTerminalPlugin extends Plugin {
	blockManager = new BlockManager(this);
	private serverProcess: ChildProcess | null = null;
	async onload() {
		this.startServer()
		await this.blockManager.registerZenTermBlock()
	}

	onunload() {
		if (this.serverProcess) {
			this.serverProcess.kill();
			this.serverProcess = null;
		}
	}
	startServer() {
		const vaultAdapter = this.app.vault.adapter as FileSystemAdapter;
		const vaultPath = vaultAdapter.getBasePath();
		const serverPath = `${vaultPath}/.obsidian/plugins/obsidian-dump-terminal/main`;

		this.serverProcess = exec(serverPath, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing server: ${error.message}`);
				return;
			}
			if (stderr) {
				console.error(`Server stderr: ${stderr}`);
				return;
			}
			console.log(`Server stdout: ${stdout}`);
		});
	}


}


