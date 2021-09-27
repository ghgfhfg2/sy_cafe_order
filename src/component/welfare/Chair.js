import React,{useEffect,useState} from 'react';
import { getFormatDate } from '../CommonFunc';

function Chair() {
  const curDate = getFormatDate(new Date());
  const [UseData, setUseData] = useState();
  const timeTable = (time) => {
    const first = new Date(curDate.year,curDate.og_month,curDate.og_day,8,30);
    const last = new Date(curDate.year,curDate.og_month,curDate.og_day,18,0);
    let timeArr = [];
    const useTime = time;
    let n = 0;
    while(useTime*n < last){
      let obj = {
        time:useTime*n + first
      }
      timeArr.push(obj);
      n++
    }
    console.log(timeArr)
  }  
  timeTable(15);

  useEffect(() => {
    

    return () => {
      
    }
  }, [])
  return (
    <>

    </>
  )
}

export default Chair
