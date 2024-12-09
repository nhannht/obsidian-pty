package backend

import (
	"fmt"
	"github.com/shirou/gopsutil/v4/net"
	"github.com/shirou/gopsutil/v4/process"
)

func IsPortFree(port int64) bool {
	connections, err := net.Connections("tcp")
	if err != nil {
		fmt.Printf("Error retrieving network connections: %v\n", err)
		return false
	}

	for _, conn := range connections {
		if conn.Laddr.Port == uint32(port) {
			return false
		}
	}
	return true
}

func GetProcessByPort(port int64) (*process.Process, error) {
	connections, err := net.Connections("tcp")
	if err != nil {
		return nil, fmt.Errorf("error retrieving network connections: %v", err)
	}

	for _, conn := range connections {
		if conn.Laddr.Port == uint32(port) {
			proc, err := process.NewProcess(conn.Pid)
			if err != nil {
				return nil, fmt.Errorf("error retrieving process for PID %d: %v", conn.Pid, err)
			}
			return proc, nil
		}
	}
	return nil, fmt.Errorf("no process found on port %d", port)
}

// Function to kill the process by port
func KillProcessByPort(port int64) error {
	proc, err := GetProcessByPort(port)
	if err != nil {
		return err
	}

	if err := proc.Kill(); err != nil {
		return fmt.Errorf("failed to kill process on port %d: %v", port, err)
	}

	fmt.Printf("Process on port %d has been killed.\n", port)
	return nil
}
