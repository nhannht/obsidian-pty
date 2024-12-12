import fs from "fs";
import https from "https";

export type BlockSetting = {
	name: string,

}
// Remember to rename these classes and interfaces!
export type ProfileConfig = {
	name: string;
	port: number,
	command: string,

}

export type ScanResult = {
	message?: string
	port?: number
	process?: string
	pid? :number,
	status?:string

}

export const readJSONFile = (path: string) => {
	const text = fs.readFileSync(path, 'utf8');
	return JSON.parse(text);
}

export function downloadFile(url: string, output: string) {
	https.get(url, (response) => {
		if (response.statusCode === 200) {
			const file = fs.createWriteStream(output);
			response.pipe(file);
			file.on('finish', () => {
				file.close();
				console.log('Download completed.');
				// Set the file as executable
				fs.chmod(output, 0o755, (err) => {
					if (err) {
						console.error(`Error setting file as executable: ${err.message}`);
					} else {
						console.log('File permissions set to executable.');
					}
				});
			});
		} else if (response.statusCode === 302 || response.statusCode === 301) {
			// Follow redirect
			const redirectUrl = response.headers.location;
			if (redirectUrl) {
				console.log(`Redirecting to ${redirectUrl}`);
				this.downloadFile(redirectUrl, output);
			} else {
				console.error('Redirect location not found.');
			}
		} else {
			console.error(`Failed to download file: ${response.statusCode}`);
		}
	}).on('error', (err) => {
		console.error(`Error: ${err.message}`);
	});
}
