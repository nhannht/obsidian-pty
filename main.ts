import {Plugin} from 'obsidian';
import BlockManager from "./src/BlockManager";

export default class ZenTerminalPlugin extends Plugin {
	blockManager = new BlockManager(this);

	async onload() {
		await this.blockManager.registerZenTermBlock()

	}

	onunload() {

	}


}


