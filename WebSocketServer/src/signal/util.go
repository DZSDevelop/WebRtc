package signal

import "time"

//当前时间戳
func Timestamp() int64 {
	return time.Now().Unix()
}
