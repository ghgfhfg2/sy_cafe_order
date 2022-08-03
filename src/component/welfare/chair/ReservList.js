import { Button, Popconfirm, Statistic } from 'antd';
import React from 'react';
import * as antIcon from "react-icons/ai";
const { Countdown } = Statistic;



function ReservList({el,idx,CurDate,onRerender,onCancel}) {
  return (
    <li key={idx}>
      <div className="box">
        <div className="r-day">
          <span className="room">{el.room}</span>
          <span className="date fon-barlow">
            {
              el.date.full === CurDate.full ? 
              '오늘 ' :
              `${el.date.full_} `
            } 
            {el.date.hour}:{el.date.min}
            </span>
        </div>
        <div className="right">
          <div className="count-box">
            <antIcon.AiOutlineHourglass className="ic-time" />
            <Countdown
              className="countdown"
              value={el.date.timestamp}
              format="H시간 m분 s초"
              onFinish={onRerender}
            />
          </div>
          <Popconfirm
            title="예약 취소 하시겠습니까?"
            onConfirm={()=>{onCancel(el.date,el.timeNum,el.roomNum)}}
          >                  
            <Button className="btn-del"><antIcon.AiOutlineRollback /><span className="no-mo">예약취소</span></Button>
          </Popconfirm>
        </div>
      </div>
    </li>    
  )
}

export default ReservList