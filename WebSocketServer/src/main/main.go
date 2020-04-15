package main

import (
	pusher "WebSocketServer/src/Pusher"
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
)

func main() {
	http.Handle("/websocket", websocket.Handler(pusher.Handler))
	// admin
	http.HandleFunc("/admin", func(writer http.ResponseWriter, request *http.Request) {
		_, _ = fmt.Fprintln(writer, *pusher.CManager.Online)
	})

	fmt.Println("Listen and serve on port 8080")

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Listen and serve error: ", err)
	}
}
