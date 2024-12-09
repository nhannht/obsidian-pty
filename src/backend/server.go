package backend

import (
	"github.com/creack/pty"
	"github.com/gorilla/websocket"
	"io"
	"log"
	"net/http"
	"os/exec"
	"regexp"
	"strconv"
	"sync"
)

func SplitCommand(command string) []string {
	// Regular expression to match words or quoted strings
	re := regexp.MustCompile(`"([^"]*)"|'([^']*)'|(\S+)`)
	matches := re.FindAllStringSubmatch(command, -1)

	var parts []string
	for _, match := range matches {
		for _, group := range match[1:] {
			if group != "" {
				parts = append(parts, group)
				break
			}
		}
	}
	return parts
}

func StartServer(config ServerConfig) {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}
		defer conn.Close()
		cmdParts := SplitCommand(config.Command)
		cmd := exec.Command(cmdParts[0], cmdParts[1:]...)
		ptmx, err := pty.Start(cmd)
		if err != nil {
			log.Printf("Failed to start command: %v", err)
			return
		}
		defer func() {
			err = ptmx.Close()
			if err != nil {
				log.Printf("Error closing PTY: %v\n", err)
			}
		}() // Best effort

		var wg sync.WaitGroup
		wg.Add(2)

		go func() {
			defer wg.Done()
			for {
				_, message, err := conn.ReadMessage()
				if err != nil {
					log.Printf("Error reading message: %v", err)
					return
				}
				_, err = ptmx.Write(message)
				if err != nil {
					log.Println("Error writing to PTY: %v", err)
					return
				}
			}
		}()

		go func() {
			defer wg.Done()
			buf := make([]byte, 1024)
			for {
				n, err := ptmx.Read(buf)
				if err != nil {
					if err != io.EOF {
						log.Printf("Error reading from PTY: %v", err)
					}
					return
				}
				if err := conn.WriteMessage(websocket.TextMessage, buf[:n]); err != nil {
					log.Printf("Error writing message: %v", err)
					return
				}
			}
		}()

		wg.Wait()
		log.Printf("Connection closed for backend %s", config.Name)
	})

	server := &http.Server{
		Addr:    ":" + strconv.FormatInt(config.Port, 10),
		Handler: mux,
	}

	log.Printf("Starting backend %s (command: %s) on port %v\n", config.Name, config.Command, config.Port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start backend %s: %v", config.Name, err)
	}
}
