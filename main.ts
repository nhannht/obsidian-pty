import {Plugin} from 'obsidian';
import BlockManager from "./src/BlockManager";
import "@xterm/xterm/css/xterm.css";

export default class ZenTerminalPlugin extends Plugin {
	blockManager = new BlockManager(this);

	async onload() {
		await this.blockManager.registerZenTermBlock()

	}

	onunload() {

	}


}


