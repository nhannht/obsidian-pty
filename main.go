package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/nhannht/obsidian-zen-terminal/src/backend"
	"log"
	"os"
)

func printJSON(result backend.Result) {
	jsonData, err := json.Marshal(result)
	if err != nil {
		log.Printf("Error marshalling JSON: %v", err)
		return
	}
	fmt.Println(string(jsonData))
}

const (
	ServerFlag  = "server"
	ScanFlag    = "scan"
	KillFlag    = "kill"
	ProcessFlag = "process"
	NameFlag    = "name"
	PortFlag    = "port"
	CommandFlag = "command"
)

func printScanResult(result backend.ScanResult) {
	jsonData, err := json.Marshal(result)
	if err != nil {
		log.Printf("Error marshalling JSON: %v", err)
		return
	}
	fmt.Println(string(jsonData))
}

func main() {

	// Define the "server" flag
	server := flag.Bool(ServerFlag, false, "Start the server with the specified configuration")

	// Define the "scan" flag with sub-options
	scan := flag.Bool(ScanFlag, false, "Scan options: 'isfree' to check if a port is free, 'process' to find the process using a port")

	// Define the "process" flag with sub-options
	process := flag.String(ProcessFlag, "", "Process options: 'kill' to terminate the process on a port")

	// Define flags for Name, Port, and Command

	name := flag.String(NameFlag, "default", "Name of the server")
	port := flag.Int64(PortFlag, 8080, "Port number for the server")
	command := flag.String(CommandFlag, "bash", "Command to run in the server")

	flag.Parse()

	// Check if the "server" flag is set
	if *server {
		// Ensure that "name", "port", and "command" are provided
		if *name == "" || *port == 0 || *command == "" {
			message := "Error: 'name', 'port', and 'command' flags are required when 'server' is specified."
			printJSON(backend.Result{Message: message})
			flag.Usage()
			os.Exit(1)
		}

		// Create a ServerConfig using the parsed flags
		config := backend.ServerConfig{
			Name:    *name,
			Port:    *port,
			Command: *command,
		}

		// Start the server with the provided configuration
		go backend.StartServer(config)

		// Block forever
		select {}
	} else if *scan {
		isFree := backend.IsPortFree(*port)
		if isFree {
			printJSON(backend.Result{Message: fmt.Sprintf("Port %d is free.", *port)})
			return
		} else {
			proc, err := backend.GetProcessByPort(*port)
			if err != nil {
				printJSON(backend.Result{Message: fmt.Sprintf("Error: %v", err)})
			} else {
				name, _ := proc.Name()
				printScanResult(backend.ScanResult{
					Port:    *port,
					Pid:     int64(proc.Pid),
					Process: name,
					Status:  "busy",
					Message: "This port is being used",
				})
			}

		}

		return
	} else if *process != "" {
		switch *process {
		case KillFlag:
			err := backend.KillProcessByPort(*port)
			if err != nil {
				printJSON(backend.Result{Message: fmt.Sprintf("Error: %v", err)})
			} else {
				message := fmt.Sprintf("Process on port %d has been killed.", *port)
				printJSON(backend.Result{Message: message})
			}
		default:
			message := "Invalid process option. Use '-process kill -port xxx'."
			printJSON(backend.Result{Message: message})
			os.Exit(1)
		}
		return
	} else {
		flag.Usage()

	}

}
