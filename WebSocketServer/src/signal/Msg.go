package signal

import "encoding/json"

type MessageType int
type MediaType int

//消息类型
const (
	SingleChat MessageType = iota
	GroupChat
	Broadcast
)

//定义消息体
type Msg struct {
	MessageType MessageType `json:"messageType"`
	From        string      `json:"from"`
	To          []string    `json:"to"`
	Content     string      `json:"content,omitempty"`
	CreateAt    int64       `json:"createAt,omitempty"`
	UpdateAt    int64       `json:"updateAt,omitempty"`
}

func (m *Msg) toString() string {
	if js, err := json.Marshal(m); err == nil {
		return string(js)
	}
	return ""
}
