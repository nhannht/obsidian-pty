import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import BlockManager from "./src/BlockManager";
import "@xterm/xterm/css/xterm.css";

// Remember to rename these classes and interfaces!


export default class ZenTerminalPlugin extends Plugin {
	blockManager = new BlockManager(this);
	async onload() {
		await this.blockManager.registerZenTermBlock()
	}

	onunload() {

	}


}


