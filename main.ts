import {Plugin} from 'obsidian';
import BlockManager from "./src/BlockManager";

export default class PTYPlugin extends Plugin {
	blockManager = new BlockManager(this);

	async onload() {
		await this.blockManager.registerZenTermBlock()

	}

	onunload() {

	}


}


