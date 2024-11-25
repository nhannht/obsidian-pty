import ZenTerminalPlugin from "../main";
import {createRoot} from "react-dom/client";
import {StrictMode, useEffect, useRef} from "react";
import {Terminal} from "@xterm/xterm";
import {FitAddon} from '@xterm/addon-fit';
import {FileSystemAdapter, MarkdownPostProcessorContext} from "obsidian";

export function ZenTermBlock(props:{
    plugin:ZenTerminalPlugin,
    ctx:MarkdownPostProcessorContext,
    src:string,
}) {
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const socketRef = useRef<WebSocket|null>(null);
	const hasExecutedRef = useRef<boolean>(false);

    useEffect(() => {
		const vaultAdapter = props.plugin.app.vault.adapter as FileSystemAdapter
		const vaultPath = vaultAdapter.getBasePath()

        if (terminalRef.current) {
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
                    const message = event.data;
                    terminal.write(message);
                };

                socket.onclose = () => {
                    console.log("WebSocket closed, attempting to reconnect...");
                    setTimeout(connectWebSocket, 5000); // Reconnect after 1 second
                };

                socket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    socket.close();
                };
            };

            connectWebSocket();
            return () => {
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
