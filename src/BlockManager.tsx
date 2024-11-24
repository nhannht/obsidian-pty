import ZenTerminalPlugin from "../main";
import {createRoot} from "react-dom/client";
import {StrictMode, useEffect, useRef, useState} from "react";
import {Terminal} from "@xterm/xterm";
import {FitAddon} from '@xterm/addon-fit';
import {MarkdownPostProcessorContext} from "obsidian";

export function GenerateRandomId() {
	const currentTime = Date.now().toString();
	const randomString = Math.random().toString(36).substring(2, 15); // Generate a random string
	return currentTime + randomString; // Concatenate the current time and random string
}

export type Settings = {
	id:string
}
export function ZenTermBlock(props:{
	plugin:ZenTerminalPlugin,
	ctx:MarkdownPostProcessorContext,
	src:string,
}) {
	const terminalRef = useRef<HTMLDivElement | null>(null);
	const socketRef = useRef<WebSocket|null>(null);


	useEffect(() => {
		if (terminalRef.current ) {
			const terminal = new Terminal();
			const fitAddon = new FitAddon();
			terminal.loadAddon(fitAddon);
			terminal.open(terminalRef.current);
			fitAddon.fit();


			const connectWebSocket = () => {
				const socket = new WebSocket(`ws://localhost:8080/ws`);
				socketRef.current = socket;

				socket.onopen = () => {
					terminal.onData(data => {
						socket.send(data);
					});
				};

				socket.onmessage = (event) => {
					terminal.write(event.data);
				};

				socket.onclose = () => {
					console.log("WebSocket closed, attempting to reconnect...");
					setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
				};

				socket.onerror = (error) => {
					console.error("WebSocket error:", error);
					socket.close();
				};
			};

			connectWebSocket();
			return ()=>{
				socketRef.current?.close();
			}
		}
	}, []);

	return (
		<div ref={terminalRef} style={{width: '100%', height: '100%'}}></div>
	);

}

export default class BlockManager {
	constructor(public plugin: ZenTerminalPlugin) {
	}

	async registerZenTermBlock() {


		this.plugin.registerMarkdownCodeBlockProcessor("term", async (source, el, ctx) => {
			let root = el.createEl("div", {
				"cls": "root"
			})

			let reactRoot = createRoot(root)
			reactRoot.render(
				<StrictMode>
					<ZenTermBlock ctx={ctx} src={source} plugin={this.plugin}/>
				</StrictMode>
			)
		})
	}

}

