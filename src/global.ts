import {ChildProcess} from "node:child_process";

export type BlockSetting = {
	name: string,
}
// Remember to rename these classes and interfaces!
export type ServerConfig = {
	name:string;
	port: number,
	command: string,

}
