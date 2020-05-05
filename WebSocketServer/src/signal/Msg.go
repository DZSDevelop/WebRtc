package signal

import "encoding/json"

type MessageType int
type MediaType int

//消息类型
const (
	SingleChat MessageType = iota
	GroupChat
)

const (
	Text MediaType = iota
	Image
)

//定义消息体
type Msg struct {
	MessageType MessageType `json:"message_type"`
	MediaType   MediaType   `json:"media_type"`
	From        string      `json:"from"`
	To          string      `json:"to"`
	Content     string      `json:"content,omitempty"`
	CreateAt    int64       `json:"create_at,omitempty"`
	UpdateAt    int64       `json:"update_at,omitempty"`
}

func (m *Msg) toString() string {
	if js, err := json.Marshal(m); err != nil {
		return string(js)
	}
	return ""
}
