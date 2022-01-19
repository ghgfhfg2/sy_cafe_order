import React, { useState, useEffect } from "react";
import firebase, {old} from "../../firebase";
import { Radio,Button,DatePicker,message } from "antd";
import * as antIcon from "react-icons/ai";
import { commaNumber,getFormatDate } from "../CommonFunc";
import { CSVLink } from "react-csv";
import moment from 'moment';

const curDate = getFormatDate(new Date());
function AdminOrderList() {

  const [OrderList, setOrderList] = useState([]);
  const [SelectDay, setSelectDay] = useState();
  const [LastDay, setLastDay] = useState()
  const [PrevDay, setPrevDay] = useState()
  const [SumAmount, setSumAmount] = useState()
  const [SumPrice, setSumPrice] = useState()
  const [Add1Count, setAdd1Count] = useState()
  const [Add2Count, setAdd2Count] = useState()
  const [SumAddAmount, setSumAddAmount] = useState()

  const [SearchDate, setSearchDate] = useState(curDate);
  const [Render, setRender] = useState(true);

  const [excelData, setExcelData] = useState()
  const excelHeaders = [
    {label: "주문자", key:"order_name"},
    {label: "상품명", key:"prod_name"},
    {label: "수량", key:"amount"},
    {label: "추가", key:"add"},
    {label: "추가2", key:"add2"},
    {label: "코멘트", key:"order_etc"},
    {label: "주문시간", key:"order_time"},
    {label: "가격", key:"price"}
  ]

  useEffect(() => {
    let mounted = true;
    let limitDateStart = SearchDate.timestamp - 36000000;
    let limitDateEnd = SearchDate.timestamp + 36000000;
    if (mounted) {     
        firebase
        .database()
        .ref("order")
        .orderByChild("timestamp")
        .startAt(limitDateStart)
        .endAt(limitDateEnd)
        .on("value", (snapshot) => {
          let array = [];
          snapshot.forEach(function (item) {
            array.push({
              ...item.val(),
              key: item.key,
            });
          });
          // eslint-disable-next-line array-callback-return          
          array.sort((a, b) => {
            if (a.timestamp > b.timestamp) {
              return -1;
            }
            if (a.timestamp < b.timestamp) {
              return 1;
            }
          });
          array = array.filter(el=>{
            var date = getFormatDate(new Date(el.timestamp)).full;
            return date === SearchDate.full && el.order_state === 2
          })  
          
          array.map(el=>{
            if(el.hot === 'hot') el.prod_name = `따뜻한 ${el.prod_name}`
            if(el.hot === 'ice') el.prod_name = `차가운 ${el.prod_name}`
            if(el.prod_option) el.prod_name = el.prod_name +'-'+el.prod_option
          })
          const day = ['월요일','화요일','수요일','목요일','금요일']
          setLastDay(array[0].order_time.split("|")[1])
          let prevDayIndex = day.indexOf(LastDay)-1          
          if(prevDayIndex < 0){
            prevDayIndex = 4;
          }  
          setPrevDay(day[prevDayIndex]);
          if(SelectDay){           
            array = array.filter(el => {
              return el.order_time.includes(SelectDay)
            })
            let sumA = 0;
            let sumP = 0;
            let add1C = 0;
            let add2C = 0;
            array.map(el => {
              sumA += parseInt(el.amount)
              if(el.add && el.add.includes('버블')) {
                el.price -= 500;
                add1C += 1
              }
              if(el.add2 && el.add2.includes('샷1')) {
                el.price -= 500;                
                add2C += 1
              }
              if(el.add2 && el.add2.includes('샷2')) {
                el.price -= 1000;
                add2C += 2
              }              
            })
            setSumAmount(sumA)
            setAdd1Count(add1C)
            setAdd2Count(add2C)
            setSumAddAmount(add1C+add2C)  
            array = array.reduce((a,c)=>{
              let x = a.find(e=>(e.prod_name===c.prod_name && e.hot===c.hot))
              if(!x) a.push(Object.assign({},c))
              else {
                x.og_price += c.og_price
                x.amount += c.amount
              };
              return a
            },[])                 
            array.map(el => {
              sumP += el.price * el.amount
              el.price = el.price * el.amount
            })     
            setSumPrice(sumP)

            array = array.sort((a,b) => {
              if (a.category > b.category) {
                return -1;
              }
              if (a.category < b.category) {
                return 1;
              }
            })
          }            
          console.log(array)
          setExcelData(array);
          setOrderList(array);          
        });
      }
      return function cleanup() {
        firebase.database().ref("order").off();
        mounted = false;
      };
    }, [SelectDay,Render]);
    
    const onSelectDay = (e) => {
      if(e.target.value === '1'){
        setSelectDay("")
      }
      if(e.target.value === '2'){
        setSelectDay(LastDay)
      }
      if(e.target.value === '3'){
        setSelectDay(PrevDay)
      }
    }      
    
    const onSelectDate = (date, dateString) => {
      setSearchDate(getFormatDate(date._d))
      setRender(!Render)
    }
  
    const disabledDate = (current) => {
      return current < moment().subtract(30, 'days') || current > moment();
    }    


    const kakaoSend = (key) => { 

      // 올드DB에 추가
      let newData = key;
      newData.order_state = 2
      firebase.database(old).ref(`order/${newData.key}`)
      .update({
        ...newData
      })
  
      /*
      firebase.database().ref('order')
      .once("value",data=>{
        data.forEach(el=>{                                
          if(el.val().timestamp < (new Date().getTime() - 2592000000)){
            firebase.database().ref(`order/${el.key}`).remove()
          }
        })
      })  
      */
  
      let time = getFormatDate(new Date());
      time = time.full+time.hour+time.min+time.sec
      let url = "https://metree.co.kr/_sys/_xml/order_kakao.php?order_tel="+ key.order_phone +"&goods_name="+ key.prod_name + "&order_time=" + time;
      window.open(url,'kakao',"height=1,width=1");

      message.success('카톡알림이 발송되었습니다.')
      return;
    }    
  return (
    <>
      <h3 className="title">완료내역</h3>
      
      <Radio.Group onChange={onSelectDay} defaultValue="1" buttonStyle="solid">
        <Radio.Button value="1">전체</Radio.Button>
        <Radio.Button value="2">수량합계</Radio.Button>
        {/* <Radio.Button value="3">어제</Radio.Button> */}
      </Radio.Group> 
      {/* <span style={{fontSize:"13px",marginLeft:"5px"}}>(영업일 기준)</span> */}
     
      <DatePicker 
        format="YYYY-MM-DD"
        defaultValue={moment()}
        style={{marginLeft:"10px"}}
        disabledDate={disabledDate} onChange={onSelectDate} 
      />
      {excelData &&
        <Button style={{marginLeft:"10px"}}>
          <CSVLink 
            headers={excelHeaders} 
            data={excelData} 
            filename={`metree-cafe${curDate.full}.csv`} 
            target="_blank"
          >
            <antIcon.AiOutlineFileExcel style={{position:"relative",top:"3px",fontSize:"17px",marginRight:"3px"}} />엑셀 다운로드
          </CSVLink>
        </Button>
      }
      {!SelectDay && 
        <table className="fl-table" style={{marginTop:"12px"}}>
          <thead>
            <tr>
              <th scope="col">알림재발송</th>
              <th scope="col">주문자</th>
              <th scope="col">상품명</th>
              <th scope="col">수량</th>
              <th scope="col" colSpan="2">추가</th>
              <th scope="col">코멘트</th>
              <th scope="col">주문시간</th>
              <th scope="col">가격</th>
            </tr>
          </thead>
          <tbody>
            {OrderList.map((list, index) => (
              <tr key={index}>
                <td><Button onClick={()=>{kakaoSend(list)}}><antIcon.AiOutlineAlert style={{marginTop:"2px",fontSize:"17px"}} /></Button></td>
                <td>{list.order_name}</td>
                <td>
                  {list.prod_name}
                </td>
                <td>{list.amount}</td>
                <td>{list.add}</td>
                <td>{list.add2}</td>
                <td>{list.order_etc}</td>
                <td>{list.order_time}</td>
                <td>{list.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      {SelectDay && 
        <>
        <div style={{marginTop:"12px"}}>
        {OrderList[0] && 
          <span>{OrderList[0].order_time}</span>
        }        
        </div>
        <div style={{display:"flex"}}>
        <table className="fl-table" style={{marginTop:"12px",width:"48%"}}>
          <thead>
            <tr>
              <th scope="col">상품명</th>
              <th scope="col">수량</th>
              <th scope="col">가격</th>
            </tr>
          </thead>
          <tbody>
            {OrderList && OrderList.map((list, index) => (
              <tr key={index}>
                <td>
                  {list.hot === "ice" && "차가운 "}
                  {list.prod_name}
                </td>
                <td>{list.amount}</td>
                <td>{list.price}</td>
              </tr>
            ))}
            <tr>
                <td>합계</td>
                <td>
                  {SumAmount}
                </td>
                <td>{commaNumber(parseInt(SumPrice))}</td>
            </tr>
          </tbody>
        </table>
        <table className="fl-table" style={{marginTop:"12px",marginLeft:"2%",width:"49%",height:"100px"}}>
        <thead>
          <tr>            
            <th scope="col">상품명</th>
            <th scope="col">수량</th>
            <th scope="col">가격</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td>버블추가</td>
              <td>{Add1Count}</td>
              <td></td>
            </tr>
            <tr>
              <td>샷추가</td>
              <td>{Add2Count}</td>
              <td></td>
            </tr>
          <tr>
              <td>합계</td>
              <td>
                {SumAddAmount}
              </td>
              <td>{commaNumber(parseInt(SumAddAmount*500))}</td>
          </tr>
        </tbody>
      </table>
      </div>
      </>
      }
    </>
  );  
}

export default AdminOrderList;
