package signal

import (
	"container/list"
	"errors"
	"sync"
)

type ListMsgStore struct {
	Mutex   *sync.RWMutex
	Num     int
	MsgList *list.List
}

//添加消息
func (lms *ListMsgStore) AddMsg(msg *Msg) {
	mutex := lms.Mutex
	mutex.Lock()
	defer mutex.Unlock()
	msgList := lms.MsgList
	if msgList.Len() >= lms.Num {
		msgList.Remove(msgList.Front())
	}
	msgList.PushBack(msg)
}

func (lms *ListMsgStore) Foreach(f func(msg *Msg)) error {
	mutex := lms.Mutex
	mutex.Lock()
	defer mutex.Unlock()
	msgList := lms.MsgList
	for e := msgList.Front(); e != nil; e = e.Next() {
		message, ok := e.Value.(*Msg)
		if ok {
			f(message)
		} else {
			return errors.New("invalid type *Message")
		}
	}
	return nil
}

var historicalList = &ListMsgStore{
	new(sync.RWMutex),
	100,
	list.New(),
}
