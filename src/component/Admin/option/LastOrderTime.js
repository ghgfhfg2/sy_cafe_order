import React, {useState,useEffect} from 'react';
import {Switch,TimePicker,Button,message} from 'antd';
import firebase from "../../../firebase";
import moment from "moment";

function LastOrderTime() {
  
  const [TimeRegist, setTimeRegist] = useState(false);
  const [timeState, setTimeState] = useState();

  useEffect(() => {
    firebase.database().ref('last_order_time')
    .on('value',snapshot=>{
      snapshot.val() && setTimeState(snapshot.val())
    })
    return () => {
      firebase.database().ref('last_order_time').off()
    }
  }, [])
  

  const TimeRegistToggle = () => {
    setTimeRegist(!TimeRegist);
  };  
  const format = 'HH:mm';
  const onChageTime = (e,t) => {
    let time = {
      time:t,
      hour:t.split(':')[0],
      min:t.split(':')[1],
    }
    setTimeState(time)
  }
  const onTimeSet = () => {
    firebase.database().ref('last_order_time').update(timeState);
    message.success("적용완료")
  }
  return (
    <>
      <div className="flex-box a-center" style={{ marginBottom: "10px" }}>
        <h3 className="title" style={{ margin: "0 10px 0 0" }}>
        판매 마감시간 설정
        </h3>
        <Switch
          onChange={TimeRegistToggle}
          checkedChildren="on"
          unCheckedChildren="off"
        />
      </div> 
      {TimeRegist &&
      <>
      <div style={{marginBottom:"20px"}}>
        <div className="time-seting">
          <div className="tit">
            판매 마감시간
          </div>
          {timeState &&
            <TimePicker onChange={onChageTime} className="time1" defaultValue={moment(`${timeState.time}`, format)} format={format} />
          }
          {!timeState &&
            <TimePicker onChange={onChageTime} className="time1" format={format} />
          }
        </div>
        <Button
          htmlType="button"
          style={{ width: "100%",maxWidth:"250px" }}
          type="primary"
          size="large"
          onClick={onTimeSet}
        >
          시간설정 적용하기
        </Button>
      </div>
      </>
      }
    </>
  )
}

export default LastOrderTime