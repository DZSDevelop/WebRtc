package pusher

import (
	"container/list"
	"errors"
	"sync"
)

type MessageType int
type MediaType int

const (
	Single MessageType = iota
	Group
	OnLineNotify
	OffLineNotify
)

const (
	Text MediaType = iota
	Image
	File
	SDP
	ASDP
	ICE
	AICE
)

type Offer struct {
	Type string `json:"type"`
	Sdp  string `json:"sdp"`
}
type Ice struct {
	Candidate     string `json:"candidate"`
	SdpMid        string `json:"sdpMid"`
	SdpMLineIndex int64  `json:"sdpMLineIndex"`
}

// websocket message
type Message struct {
	MessageType MessageType `json:"messageType"`
	MediaType   MediaType   `json:"mediaType"`
	From        string      `json:"from"`
	To          string      `json:"to"`
	Content     string      `json:"content,omitempty"`
	FileId      string      `json:"fileId,omitempty"`
	Url         string      `json:"url,omitempty"`
	Offer       Offer       `json:"offer,omitempty"`
	Ice         Ice         `json:"ice,omitempty"`
	CreateAt    int64       `json:"createAt,omitempty"`
	UpdateAt    int64       `json:"updateAt,omitempty"`
}

// last messages
type LastMessageStore struct {
	mutex    *sync.RWMutex //读写锁
	number   int
	messages *list.List
}

func (lms *LastMessageStore) Add(message *Message) {
	mutex := lms.mutex
	mutex.Lock()
	defer mutex.Unlock()

	messages := lms.messages
	if messages.Len() >= lms.number {
		e := messages.Front()
		messages.Remove(e)

	}
	messages.PushBack(message)
}

func (lms *LastMessageStore) Foreach(f func(message *Message)) error {
	mutex := lms.mutex
	mutex.RLock()
	defer mutex.RUnlock()

	messages := lms.messages
	for e := messages.Front(); e != nil; e = e.Next() {
		message, ok := e.Value.(*Message)
		if ok {
			f(message)
		} else {
			return errors.New("invalid type *Message")
		}
	}

	return nil
}

var LastMessage = &LastMessageStore{
	mutex:    new(sync.RWMutex),
	number:   100,
	messages: list.New(),
}
