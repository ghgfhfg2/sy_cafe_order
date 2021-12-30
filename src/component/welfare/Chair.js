import React,{useEffect,useState} from 'react';
import firebase, {wel} from "../../firebase";
import { useSelector } from "react-redux";
import { Popover, Popconfirm, message, Button, DatePicker, Statistic } from 'antd';
import * as antIcon from "react-icons/ai";
import * as imIcon from "react-icons/im";
import { getFormatDate, curWeek } from '../CommonFunc';
import moment from 'moment';
import { constant } from 'lodash';
import axios from 'axios'
const { Countdown } = Statistic;

function Chair() {
  const todayDate = getFormatDate(new Date())
  const userInfo = useSelector((state) => state.user.currentUser);
  const welDb = firebase.database(wel);
  const [CurDate, setCurDate] = useState(getFormatDate(new Date()))
  const [TimeData, setTimeData] = useState();

  const timeTable = (time,chair,start1,start2,end1,end2) => {
    const first = new Date(SearchDate.year,SearchDate.og_month,SearchDate.og_day,start1,start2);
    const last = new Date(SearchDate.year,SearchDate.og_month,SearchDate.og_day,end1,end2);
    let timeArr = [];
    let copy = timeArr.concat()
    let n = 0;
    let chairArr = [];
    for(let i=1;i<=chair;i++){
      chairArr.push({
        room_num:i
      })
    }
    while(first.getTime() < last.getTime()){
      let obj = {
        timeNum:n+1,
        time:getFormatDate(first),
        room:chairArr
      }
      first.setMinutes(first.getMinutes()+time)
      timeArr.push(obj);
      n++;
    }    
    return timeArr;
  }
  
  const [Rerender, setRerender] = useState(false);
  const onRerender = () => {
    setRerender(!Rerender);
  }
  const [ListData, setListData] = useState()
 
  const getListOff = () => {
    welDb.ref(`chair/list/${CurDate.full}`).off()
  }

  const [DefaultNotice, setDefaultNotice] = useState()
  useEffect(() => {
    welDb.ref('chair/notice')
    .once('value', data => {
      setDefaultNotice(data.val())
    })
    return () => {
    }
  }, [])

  useEffect(() => {
    setInterval(() => {
      setCurDate(getFormatDate(new Date()))
    }, 2000);
    return () => {
    }
  }, [])
  
  const [SearchDate, setSearchDate] = useState(CurDate)

  const [MyReservation, setMyReservation] = useState();
  const [ThisWeekRserv, setThisWeekRserv] = useState();

  useEffect(() => {
    //이번주 예약횟수
    let curWeekSel = [];
    let weekObj = curWeek(SearchDate.full_); //todayDate.timestamp
    welDb.ref(`chair/user/${userInfo.uid}/list`)
    .orderByKey()
    .startAt(weekObj.firstDate)
    .endAt(weekObj.lastDate)
    .on('value',data => {
      data.forEach(el=>{
        curWeekSel.push(el.val());
      })
      setThisWeekRserv(curWeekSel.length)
    })

    //시간설정
    welDb.ref('chair/time_set')
    .once('value', data => {
      const startTime = data.val() ? data.val().start : "";
      const endTime = data.val() ? data.val().end : "";
      const interval = data.val() ? data.val().interval : "";
      // 사용자 목록
      welDb.ref(`chair/user/${userInfo.uid}/list`)
      .on('value', data => {
        let userArr = [];
        data.forEach(el=>{
          for(let i in el.val()){
            if(el.val()[i].reserve_time > Date.now()){
              let room = el.val()[i].room === 'room1' ? <imIcon.ImMan /> :
                         el.val()[i].room === 'room2' ? <imIcon.ImWoman /> : <imIcon.ImManWoman />
              let obj = {
                date: getFormatDate(new Date(el.val()[i].reserve_time)),
                timestamp: el.val()[i].timestamp,
                timeNum: el.val()[i].timeNum,
                roomNum:el.val()[i].room,
                room: room
              }
              userArr.push(obj)
            }
          }        
        })
        setMyReservation(userArr)
      })
  
      // 예약목록
      let arr = [];
      welDb.ref(`chair/list/${SearchDate.full}`)
      .on('value', data => {
        let timeArr = timeTable(interval,3,startTime[0],startTime[1],endTime[0],endTime[1]); //시간표 생성
        let arr2 = JSON.parse(JSON.stringify(timeArr));
        data.forEach(el=>{
          arr.push(el.val())
        });
        timeArr.map((time,idx)=>{
          let reservCount = 0;
          arr.map(user=>{
            if(user.timeNum === time.timeNum){
              for(let key in user){ 
                if(key != 'timeNum' && user[key]){                
                  arr2[idx][key] = user[key]
                  arr2[idx].room[user[key].room-1] = {
                    ...arr2[idx].room[user[key].room-1],
                    num: 'room'+user[key].room,
                    check:true
                  }
                }
              }
            }
          })
          arr2[idx].reservCount = Object.keys(arr2[idx]).length-3;
        })
        setListData(arr2)


    })

    })
    
    return () => {
      getListOff()
    }
  }, [Rerender])


  const reservation = (num,time,chair) => {
    
    if(ThisWeekRserv >= 3){
      message.error('예약은 일주일에 3번까지 가능합니다.');        
      return;
    }
    const type = chair === 1 ? '남' : chair === 2 ? '여' : '공용';    
    const dateTime = time.full + String(time.hour) + String(time.min)
    
    let room = 'room'+chair;
    const user = {
      name: userInfo.displayName,
      part: userInfo.photoURL,
      user_uid: userInfo.uid,
      room: chair  
    }

    welDb.ref(`chair/user/${userInfo.uid}/list/${SearchDate.full}`)
    .get()
    .then(data=>{
      if (data.exists()) {
        message.error('예약은 하루에 한건만 가능합니다.');
      }else{
        
            // 예약 목록
            welDb.ref(`chair/list/${SearchDate.full}/${num}`)
            .update({
              [room]:user,
              timeNum: num
            })
        
            // 사용자 예약목록
            welDb.ref(`chair/user/${userInfo.uid}/list/${SearchDate.full}/${num}`)
            .update({
              reserve_time:time.timestamp,
              timestamp:new Date().getTime(),
              timeNum: num,
              room
            })
        
            // 카운팅
            welDb.ref(`chair/user/${userInfo.uid}/count`)
            .transaction((pre) => {
              pre++
              return pre;
            });

            message.success('예약 되었습니다.');

            /* 카톡알림
            axios.post('https://metree.co.kr/_sys/_xml/chair_api_add.php',{
              name:userInfo.displayName,
              call:userInfo.call_number,
              date:dateTime,
              type:`힐링룸(${type})`
            })
            .then(res=>{
              message.success('예약 되었습니다.');
            })
            .catch(error => {
              console.log(error) 
            });
            */           

      }
    })
  }

  const onCancel = (date,num,room) => {     
      const dateTime = date.full + String(date.hour) + String(date.min)
      welDb.ref(`chair/list/${date.full}/${num}/${room}`).remove();
      welDb.ref(`chair/user/${userInfo.uid}/list/${date.full}/${num}`).remove();
      welDb.ref(`chair/user/${userInfo.uid}/count`)
      .transaction((pre) => {
        pre--
        return pre;
      });
      
      
      axios.post('https://metree.co.kr/_sys/_xml/chair_api_del.php',{
          name:userInfo.displayName,
          call:userInfo.call_number,
          date:dateTime
        })
        .then(res=>{
          message.success('취소 되었습니다.');
        })
        .catch(error => {
          console.log(error) 
        });
        
        

      setRerender(!Rerender)
  }

  // 날짜선택
  const onSelectDate = (date, dateString) => {
    if(date){
      setSearchDate(getFormatDate(date._d));
      setRerender(!Rerender)
    }
  }
  const disabledDate = (current) => {
    return current && current >= moment().endOf('day');
  }

  return (
    <>
      {DefaultNotice &&
      <div className="item-info-box" style={{marginBottom:"20px"}}>
          <pre>{DefaultNotice}</pre>
      </div>
      }
      <div className="flex-box a-center" style={{marginBottom:"20px"}}>
      <h3 className="title" style={{marginRight:"10px"}}>날짜선택</h3>
        <DatePicker 
          format="YYYY-MM-DD"
          defaultValue={moment()}
          disabledDate={disabledDate}
          style={{marginBottom:"10px"}}
          onChange={onSelectDate} 
        />
      </div>      
      {MyReservation && MyReservation.length > 0 &&
        <>
          <h3 className="title">예정중인 내 예약목록</h3>
          <ul className="my-reserv-list">
          {MyReservation.map((el,idx)=>(
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
          ))}
          </ul>
        </>
      }
      {ListData &&
        <>
          <div className="flex-box" style={{alignItems:"baseline",marginBottom:"10px"}}>
            <h3 className="title" style={{marginTop:"25px",marginRight:"7px"}}>예약하기</h3>
            <span>- 이번주<span style={{fontSize:"12px"}}>(선택날짜기준)</span> <span style={{fontWeight:"bold"}}>{ThisWeekRserv}회</span> 이용 하셨습니다.</span>
          </div>
          <ul className="flex-box reserv-info">
            <li>
              <imIcon.ImMan /> 남자전용
            </li>
            <li>
              <imIcon.ImWoman /> 여자전용
            </li>
            <li>
              <imIcon.ImManWoman /> 남여공용
            </li>
            <li>
              <antIcon.AiOutlineBell className="info-ic-reserv" /> 예약중
            </li>
            <li>
              <antIcon.AiOutlineBell className="info-ic-my" /> 내예약
            </li>
          </ul>
          <ul className="reserv-time-list">
          {ListData.map((el,idx)=>(
            <li 
              key={idx} 
              className={
                el.time.timestamp > CurDate.timestamp &&
                el.user && el.user.user_uid === userInfo.uid ? 'my-reserve' :
                el.time.timestamp > CurDate.timestamp && el.user ? 'reserv' :
                el.time.timestamp < CurDate.timestamp ? 'timeover' : ''
              }
            >
              <div
                className={el.reservCount === 3 ? 'box full' : 'box'}
              >                
                <span className="time fon-barlow">{el.time.hour}:{el.time.min}</span>
                <div className="btn-box">
                {
                  el.room.map(list=>(
                    <>             
                    <Popconfirm
                      title={
                        list.room_num === 1 ? `남자방에 예약하시겠습니까?` :
                        list.room_num === 2 ? `여자방에 예약하시겠습니까?` :
                        `공용방에 예약하시겠습니까?`
                      }
                      disabled={el.time.timestamp < CurDate.timestamp || list.check ? true : false}
                      onConfirm={()=>{reservation(el.timeNum,el.time,list.room_num)}}
                    >
                      <Button className={
                        el[list.num] && el[list.num].user_uid === userInfo.uid ? 'my-reserv' :
                        list.check ? 'btn-reserv' : '' 
                    }>
                        {list.check ?
                          ( <Popover 
                              content={`${el[list.num].name}(${el[list.num].part})`}
                              trigger="click"
                              title="예약"
                            >                     
                              <antIcon.AiOutlineBell style={{fontSize:"16px"}} />
                            </Popover>
                          ):
                          (
                            <>
                              {
                                list.room_num === 1 ? 
                                <imIcon.ImMan /> :
                                list.room_num === 2 ?
                                <imIcon.ImWoman /> :
                                <imIcon.ImManWoman />
                              }
                            </>
                          )
                        }
                        
                      </Button>
                    </Popconfirm>  
                    </>
                  ))
                }                
                </div> 
              </div>  
            </li>
          ))}
          </ul>
        </>
      }
    </>
  )
}

export default Chair
