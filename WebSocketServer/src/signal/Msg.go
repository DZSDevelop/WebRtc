package signal

type MessageType int
type MediaType int

//消息类型
const (
	SDP MessageType = iota
	A_SDP
	ICE
	A_ICE
)

const (
	Text MediaType = iota
)

//定义消息体
type Msg struct {
	MessageType MessageType `json:"message_type"`
	MediaType   MessageType `json:"media_type"`
	From        string      `json:"from"`
	To          string      `json:"to"`
	Content     string      `json:"content,omitempty"`
	CreateAt    int64       `json:"create_at,omitempty"`
	UpdateAt    int64       `json:"update_at,omitempty"`
}
