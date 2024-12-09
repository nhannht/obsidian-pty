> Using linux command via PTy in Obsidian, very cool and pro, just like Nhannht

>[!note]
> Very experiment, not tested in Windows and Mac system, and it will not work on mobile

## Example of terminal emulator
#### Install from source
- Clone the repo into ${vault_path}/.obsidian/plugins/obsidian-pty
- Compile the main.go using go build, and compile the main.ts by yarn -> yarn run build
- Create the server_config.json file with the syntax like the example below
- Run the binary, it will read config from "server_config.json" (put both back-end executable and the config file in your ${vault_dir}/.obsidian/plugins/obsidian-pty/) and will run multi servers in parallel for each profile in the setup ports.
- Example of server config
```json
[
	{
		"name": "bash backend",
		"command": "/usr/bin/bash",
		"port": "12345"
	},
	{
		"name": "fish backend or naming anything you like, this field was treated like an id",
		"command": "sh -c /usr/bin/fish",
		"port": "12346"
	}
]

```

- If the port is already using by other programs, the log in terminal will show you

- Connect with the pty in obsidian markdown file using the name
````
```term
{
"name": "bash server"
}
```
````

- Well, and it just worked, you have a terminal. 

- Well, in theory, it will work on all any command that can run via linux shell, just toy with it
