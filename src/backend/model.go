package backend

type ScanResult struct {
	Port    int64  `json:"port"`
	Pid     int64  `json:"pid"`
	Process string `json:"process"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type Result struct {
	Message string `json:"message"`
}

type ServerConfig struct {
	Name    string `json:"name"`
	Port    int64  `json:"port"`
	Command string `json:"command"`
}
