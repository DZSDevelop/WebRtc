package main

import (
	pusher "WebSocketServer/src/Pusher"
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
)

//func echoHandler(ws *websocket.Conn) {
//	msg := make([]byte, 512)
//	n, err := ws.Read(msg)
//	if err != nil {
//		fmt.Println(err)
//	}
//	fmt.Println("Receive:", msg[:n])
//}
//func main() {
//	fmt.Print("WebSocket Start")
//	http.Handle("/", websocket.Handler(echoHandler))
//
//}
func main() {
	http.Handle("/websocket", websocket.Handler(pusher.Handler))

	// Index
	http.Handle("/", http.FileServer(http.Dir("./")))

	// admin
	http.HandleFunc("/admin", func(writer http.ResponseWriter, request *http.Request) {
		_, _ = fmt.Fprintln(writer, *pusher.CManager.Online)
	})

	fmt.Println("Listen and serve on port 8080")

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Listen and serve error: ", err)
	}
}
