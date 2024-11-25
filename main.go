package main

import (
	"log"
	"net/http"
	"os/exec"
	"sync"
	"time"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}
	defer func(conn *websocket.Conn) {
		err := conn.Close()
		if err != nil {
			log.Println("Error closing connection:", err)
		}
	}(conn)

	// Create a new shell process
	c := exec.Command("bash")
	f, err := pty.Start(c)
	if err != nil {
		log.Println("Error starting pty:", err)
		return
	}
	defer func() {
		err := c.Process.Kill()
		if err != nil {
			log.Println("Error killing process:", err)
		}
	}()

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Println("Error reading message:", err)
				return
			}
			_, err = f.Write(msg)
			if err != nil {
				log.Println("Error writing to pty:", err)
				return
			}
		}
	}()

	go func() {
		defer wg.Done()
		buf := make([]byte, 1024)
		for {
			n, err := f.Read(buf)
			if err != nil {
				log.Println("Error reading from pty:", err)
				return
			}
			if err := conn.WriteMessage(websocket.TextMessage, buf[:n]); err != nil {
				log.Println("Error writing message:", err)
				return
			}
		}
	}()

	// Optional: Implement a ping-pong mechanism
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					log.Println("Error sending ping:", err)
					return
				}
			}
		}
	}()

	wg.Wait()
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
