import PTYPlugin from "../main";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {FileSystemAdapter} from "obsidian";
import {exec} from "child_process";
import {BlockSetting, ServerConfig} from "./global";
import {ZenTermBlock} from "./ZenTermBlock";
import net from "net";
import path from "path";
import fs from "fs";


export default class BlockManager {


	constructor(public plugin: PTYPlugin,
	) {
	}


	loadServerConfigs(){
		const vaultAdapter = this.plugin.app.vault.adapter as FileSystemAdapter;
		const vaultPath = vaultAdapter.getBasePath();
		const configPath = path.join(vaultPath, ".obsidian/plugins/obsidian-dump-terminal/server_config.json");

		try {
			const data = fs.readFileSync(configPath, "utf-8");
			const server_profiles = JSON.parse(data) as ServerConfig[];
			console.log("Loaded server configurations:", server_profiles);
			return server_profiles
		} catch (error) {
			console.error("Error loading server configurations:", error);
		}
		return []
	}

	async registerZenTermBlock() {
		this.plugin.registerMarkdownCodeBlockProcessor("term", async (source, el, ctx) => {
			const blockSetting: BlockSetting = JSON.parse(source)

			let root = el.createEl("div", {
				"cls": "root"
			})

			let reactRoot = createRoot(root)
			reactRoot.render(
				<StrictMode>
					<ZenTermBlock
						className={"twp"}
						ctx={ctx}

						blockSetting={blockSetting}
						server_profiles={this.loadServerConfigs()}
						plugin={this.plugin}/>
				</StrictMode>
			)
		})
	}
}
