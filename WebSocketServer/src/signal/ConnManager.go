package signal

import (
	"errors"
	"fmt"
	"golang.org/x/net/websocket"
	"strings"
	"sync"
	"sync/atomic"
)

type ConnManager struct {
	OnLineNum   *uint32
	Connections *sync.Map
}

var CManager = &ConnManager{
	OnLineNum:   new(uint32),
	Connections: new(sync.Map),
}

func (c *ConnManager) Connected(k, v interface{}) {
	c.Connections.Store(k, v)
	atomic.AddUint32(c.OnLineNum, 1)
}
func (c *ConnManager) DisConnected(k interface{}) {
	c.Connections.Delete(k)
	atomic.AddUint32(c.OnLineNum, ^uint32(1-1))
}
func (c *ConnManager) GetConnected(k interface{}) (v interface{}, ok bool) {
	return c.Connections.Load(k)
}
func (c *ConnManager) Foreach(f func(k, v interface{})) {
	c.Connections.Range(func(key, value interface{}) bool {
		f(key, value)
		return true
	})
}
func (c *ConnManager) sendMsg(v interface{}, msg *Msg) error {
	if conn, ok := v.(*websocket.Conn); ok {
		if err := websocket.JSON.Send(conn, msg); err != nil {
			return errors.New(fmt.Sprintf("Send msg error %s", err))
		}
	} else {
		return errors.New("invalid type, expect *websocket.Conn")
	}
	return nil
}
func (c *ConnManager) SendMsg(k string, msg *Msg) error {
	v, ok := c.GetConnected(k)
	if ok {
		return c.sendMsg(v, msg)
	} else {
		return errors.New("connection not exist")
	}
}
func (c *ConnManager) SendMultiMsg(keys []string, msg *Msg) {
	for _, key := range keys {
		if err := c.SendMsg(key, msg); err != nil {
			fmt.Println("Send msg error:", err)
		}
	}
}
func (c *ConnManager) BroadcastMsg(msg *Msg) {
	c.Foreach(func(k, v interface{}) {
		if err := c.sendMsg(v, msg); err != nil {
			fmt.Println("Send msg error:", err)
		}
	})
}
func (c *ConnManager) BroadcastMsgExceptClient(client string, msg *Msg) {
	c.Foreach(func(k, v interface{}) {
		if strings.Compare(client, k.(string)) != 0 {
			if err := c.sendMsg(v, msg); err != nil {
				fmt.Println("Send msg error:", err)
			}
		}
	})
}
