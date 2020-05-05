package main

import (
	signal "WebSocketServer/src/signal"
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
)

func main() {
	http.Handle("/websocket", websocket.Handler(signal.Handler))
	// admin
	http.HandleFunc("/admin", func(writer http.ResponseWriter, request *http.Request) {
		_, _ = fmt.Fprintln(writer, *signal.CManager.OnLineNum)
	})

	fmt.Println("Listen and serve on port 9090")

	if err := http.ListenAndServe(":9090", nil); err != nil {
		log.Fatal("Listen and serve error: ", err)
	}
}
