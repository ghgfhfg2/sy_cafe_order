import React,{useEffect,useState} from 'react';
import { Popconfirm } from 'antd';
import { getFormatDate } from '../CommonFunc';

function Chair() {
  const curDate = getFormatDate(new Date());
  const [UseData, setUseData] = useState();
  const timeTable = (time) => {
    const first = new Date(curDate.year,curDate.og_month,curDate.og_day,8,30);
    const last = new Date(curDate.year,curDate.og_month,curDate.og_day,18,0);
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
    console.log(timeArr)
    setUseData(timeArr)
  }  
  
  useEffect(() => {
    
    timeTable(15);

    return () => {
      
    }
  }, [])


  const reservation = () => {
    
  }
  return (
    <>
      {UseData &&
        <ul className="chair-time-list">
         {UseData.map(el=>(
           <li>
             <Popconfirm
              title="Title"
              onConfirm={()=>{reservation(el.timeNum)}}
             >
             <div className="box">
               {el.time.hour}:{el.time.min}
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
