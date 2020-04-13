package main

import (
	"fmt"
	"golang.org/x/net/websocket"
	"net/http"
)

func echoHandler(ws *websocket.Conn) {
	msg := make([]byte, 512)
	n, err := ws.Read(msg)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Receive:", msg[:n])
}
func main() {
	fmt.Print("WebSocket Start")
	http.Handle("/", websocket.Handler(echoHandler))

}
