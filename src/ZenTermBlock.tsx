import PTYPlugin from "../main";
import {MarkdownPostProcessorContext, Notice} from "obsidian";
import {BlockSetting, ProfileConfig} from "./global";
import {Terminal} from "@xterm/xterm";
import {useEffect, useRef} from "react";
import {FitAddon} from '@xterm/addon-fit';

const connectWebSocket = (retries:number,
						  terminal:Terminal,
						  profile:ProfileConfig,
						  socketRef:React.MutableRefObject<WebSocket | null>,) => {
	if (retries > 5) {
		new Notice("Retries to connected more than 5 times but still failed, giving up")
		return;
	}
	const socket = new WebSocket(`ws://localhost:${profile.port}/`);
	// console.log(socket)
	socketRef.current = socket;

	socket.onopen = () => {
		// console.log('WebSocket connection established');
		terminal.onData(data => {
			socket.send(data)
		})
	};

	socket.onmessage = (event) => {
		// console.log(`on message: ${event.data}  `);
		terminal.write(event.data);
		// terminal.scrollToBottom()
		// fitAddon.fit();
	};


	socket.onclose = () => {
		console.log('WebSocket connection closed,attempting to reconnect...');
		setTimeout(()=>connectWebSocket(retries+1,terminal,profile,socketRef), 5000);
	};

	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
		socket.close()
	};
}


export function ZenTermBlock(props: {
	plugin: PTYPlugin,
	ctx: MarkdownPostProcessorContext,
	blockSetting: BlockSetting,
	// server_profiles: ServerConfig[],
	className?: string
}) {
	const terminalRef = useRef<HTMLDivElement | null>(null);
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const profile_name = props.blockSetting.name;
		// const profile = props.server_profiles.find((p) => p.name === profile_name);
		// console.log(profile)

		if (terminalRef.current) {
			const terminal = new Terminal();
			const fitAddon = new FitAddon();
			terminal.loadAddon(fitAddon);
			terminal.open(terminalRef.current);
			setTimeout(() => fitAddon.fit(), 0)
			// window.addEventListener('resize', () => fitAddon.fit());
			const profile:ProfileConfig = {
				port:8080,
				name: "Bash",
				command:"/usr/bin/bash"
			}
			if (profile) {
				props.plugin.profileManager.startProfileIfPortIsFree(profile).then(result=>console.log(result))
				let countRetries = 0
				// console.log("We have profile")
				connectWebSocket(countRetries,terminal,profile,socketRef)
			}
		}
		return () => {
			socketRef.current?.close();
		};

	}, []);

	return (
		<div className={props.className} ref={terminalRef} style={{width: "100%", height: "100%" }}></div>
	);
}
