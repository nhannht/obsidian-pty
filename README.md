# Using linux command via PTy in Obsidian, very cool and pro, just like Nhannht

>[!note]
> Very experiment, not tested in Windows and Mac system, and it will not work on mobile

## Example of terminal emulator

- Compile the main.go, run the binary, the backend will parse file "server_config.json" (put both back-end executable and the config file in your ${vault_dir}/.obsidian/plugins/obsidian-pty/), and run multi servers for each pty in the desired ports. Example of server config
```json
[
	{
		"name": "bash server",
		"command": "/usr/bin/bash",
		"port": "12345"
	},
	{
		"name": "fish server or naming anything you like, this field was treated like an id",
		"command": "sh -c /usr/bin/fish",
		"port": "12346"
	}
]

```

- If the port is already using by other programs, the log in terminal will show you

- Connect with the pty in obsidian markdown file using the name
````
```term
```
{
"name": "fish server or naming anything you like, this field was treated like an id"
}

````

- Well, and it just worked, you have a terminal. 

- Well, in theory, it will work on all any command that can run via linux shell, just toy with it
