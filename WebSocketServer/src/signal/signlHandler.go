package signal

import (
	"errors"
	"fmt"
	"golang.org/x/net/websocket"
)

func Handler(conn *websocket.Conn) {
	var clientId string
	var err error
	if clientId, err = doConn(conn); err != nil {
		fmt.Println("Client connect error: ", err)
		return
	}
	fmt.Println("Client connected,clientId:", clientId)
	for {
		msg := new(Msg)
		if err := websocket.JSON.Receive(conn, msg); err != nil {
			fmt.Println("Can not receive . error:", err)
			continue
		}
		go doReceived(clientId, conn, msg)
	}
}

func doConn(conn *websocket.Conn) (string, error) {
	clientId, err := getClientId(conn)
	if err != nil {
		return "", err
	}
	CManager.Connected(clientId, conn)
	return clientId, nil
}

func doReceived(clientId string, conn *websocket.Conn, msg *Msg) {
	msg.UpdateAt = Timestamp()
	fmt.Printf("Received Msg. Client: %s \nMsg: %s", clientId, msg.toString())
	switch msg.MessageType {
	case SingleChat:
		if err := CManager.SendMsg(msg.To, msg); err != nil {
			fmt.Println("Send msg error: ", err)
		}
	case GroupChat:
		CManager.BroadcastMsgExceptClient(clientId, msg)
	}
}

func getClientId(conn *websocket.Conn) (string, error) {
	clientId := conn.Request().URL.Query().Get("clientId")
	if clientId == "" {

		if err := conn.Close(); err != nil {
			fmt.Println("Close connect error", err)
		}
		return "", errors.New("invalid client connected")
	}
	return clientId, nil
}

func closeConn(userId string) error {
	v, ok := CManager.GetConnected(userId)
	if !ok {
		return errors.New("connection not exist")
	}
	if err := v.(*websocket.Conn).Close(); err != nil {
		fmt.Println("Close connect error", err)
		return err
	}
	CManager.DisConnected(userId)
	return nil
}
