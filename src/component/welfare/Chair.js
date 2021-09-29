import React,{useEffect,useState} from 'react';
import firebase, {wel} from "../../firebase";
import { useSelector } from "react-redux";
import { Popconfirm, message, Button } from 'antd';
import * as antIcon from "react-icons/ai";
import { getFormatDate } from '../CommonFunc';

function Chair() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const welDb = firebase.database(wel);
  const [CurDate, setCurDate] = useState(getFormatDate(new Date()))
  const [TimeData, setTimeData] = useState();
  const timeTable = (time) => {
    const first = new Date(CurDate.year,CurDate.og_month,CurDate.og_day,8,30);
    const last = new Date(CurDate.year,CurDate.og_month,CurDate.og_day,18,0);
    let timeArr = [];
    let n = 0;
    while(first.getTime() < last.getTime()){
      let obj = {
        timeNum:n+1,
        time:getFormatDate(first)
      }
      first.setMinutes(first.getMinutes()+time)
      timeArr.push(obj);
      n++;
    }    
    setTimeData(timeArr)
    return timeArr;
  }
  
  const [Rerender, setRerender] = useState(false)
  const [ListData, setListData] = useState()
 
  const getListOff = () => {
    welDb.ref(`chair/list/${CurDate.full}`).off()
  }

  useEffect(() => {
    setInterval(() => {
      setCurDate(getFormatDate(new Date()))
    }, 2000);
    return () => {
    }
  }, [])
  
  useEffect(() => {
    console.log(1)
    let arr = [];
    welDb.ref(`chair/list/${CurDate.full}`)
    .on('value', data => {
      let timeArr = timeTable(15); //시간표 생성
      data.forEach(el=>{
        arr.push(el.val())
      });
      timeArr && timeArr.map((time,idx)=>{
        arr.map(user=>{
          if(user.timeNum === time.timeNum){
            timeArr[idx] = {...timeArr[idx], ...user}
          }
        })
      })     
      setListData(timeArr)
    })

    return () => {
      getListOff()
    }
  }, [Rerender])


  const reservation = (num) => {
    const user = {
      name: userInfo.displayName,
      part: userInfo.photoURL,
      user_uid: userInfo.uid
    }
    welDb.ref(`chair/list/${CurDate.full}/${num}`)
    .update({
      user,
      timeNum: num
    })
    message.success('예약 되었습니다.');
    return;
  }

  const onCancel = (num) => {      
      welDb.ref(`chair/list/${CurDate.full}/${num}`).remove()
      message.success('취소 되었습니다.');
      setRerender(!Rerender)
  }

  return (
    <>
      {ListData &&
        <ul className="chair-time-list">
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
             <Popconfirm
              title="예약하시겠습니까?"
              disabled={el.time.timestamp < CurDate.timestamp || el.user && el.user.user_uid ? true : false}
              onConfirm={()=>{reservation(el.timeNum)}}
             >
             <div className="box">
               <span>{el.time.hour}:{el.time.min}</span>
               {el.user && 
                <>
                {el.user.user_uid &&
                <span className="ic-reserv"><antIcon.AiOutlineBell style={{marginRight:"3px"}} />{el.user.name}({el.user.part})</span>
                }
                {el.user.user_uid === userInfo.uid &&
                <Popconfirm
                  title="예약 취소 하시겠습니까?"
                  onConfirm={()=>{onCancel(el.timeNum)}}
                >                  
                  {el.time.timestamp > CurDate.timestamp &&
                  <Button className="btn-del"><antIcon.AiOutlineRollback /><span className="no-mo">예약취소</span></Button>
                  }
                </Popconfirm>
                }
                </>
               }
             </div>  
             </Popconfirm>
           </li>
         ))}
        </ul>
      }
    </>
  )
}

export default Chair
