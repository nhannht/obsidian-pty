import PTYPlugin from "../main";
import {MarkdownPostProcessorContext} from "obsidian";
import {BlockSetting, ServerConfig} from "./global";
import {Terminal} from "@xterm/xterm";
import {useEffect, useRef} from "react";
import {FitAddon} from '@xterm/addon-fit';


export function ZenTermBlock(props: {
	plugin: PTYPlugin,
	ctx: MarkdownPostProcessorContext,
	blockSetting: BlockSetting,
	server_profiles: ServerConfig[],
	className?: string
}) {
	const terminalRef = useRef<HTMLDivElement | null>(null);
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const profile_name = props.blockSetting.name;
		const profile = props.server_profiles.find((p) => p.name === profile_name);
		// console.log(profile)

		if (terminalRef.current) {
			const terminal = new Terminal();
			const fitAddon = new FitAddon();
			terminal.loadAddon(fitAddon);
			terminal.open(terminalRef.current);
			setTimeout(() => fitAddon.fit(), 0)
			// window.addEventListener('resize', () => fitAddon.fit());
			if (profile) {
				// console.log("We have profile")
				const connectWebSocket = () => {
					const socket = new WebSocket(`ws://localhost:${profile.port}/`);
					console.log(socket)
					socketRef.current = socket;

					socket.onopen = () => {
						console.log('WebSocket connection established');
						terminal.onData(data => {
							socket.send(data)
						})
					};

					socket.onmessage = (event) => {
						console.log(`on message: ${event.data}  `);
						terminal.write(event.data);
						// terminal.scrollToBottom()
						// fitAddon.fit();
					};


					socket.onclose = () => {
						console.log('WebSocket connection closed,attempting to reconnect...');
						setTimeout(connectWebSocket, 5000);
					};

					socket.onerror = (error) => {
						console.error('WebSocket error:', error);
						socket.close()
					};
				}
				connectWebSocket()
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
