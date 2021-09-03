import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { useSelector } from "react-redux";
import { DatePicker, Button, Table } from 'antd';
import { getFormatDate, commaNumber } from '../CommonFunc';
import moment from 'moment';
const curDate = getFormatDate(new Date());

function HairAdmin() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [UserDb, setUserDb] = useState();
  const [MyHairData, setMyHairData] = useState();
  const [Rerender, setRerender] = useState(false);
  const [SearchDate, setSearchDate] = useState(curDate);
  const [TotalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    if(userInfo){
      firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .once("value", (snapshot) => {
        setUserDb(snapshot.val());
      });
    }

    let hairArr = [];
    let totalPrice = 0;
    firebase
    .database()
    .ref(`hair`)
    .once("value", (snapshot) => {
      snapshot.forEach(el=>{
        let obj = el.val();
        for (let key in obj) {
          let str = obj[key].date.full.toString().substr(0,6);
          if(str == SearchDate.full.substr(0,6)){
            totalPrice += parseInt(obj[key].price);
            hairArr.push(obj[key])
            setTotalPrice(totalPrice)
          }
        }
      })      
      hairArr.sort((a,b)=>{
        return b.timestamp - a.timestamp
      })
      hairArr.sort((a,b)=>{
        return b.date.full - a.date.full
      })
      setMyHairData(hairArr);
    });
    return () => {
      firebase.database().ref(`users/${userInfo.uid}`).off();
    }
  }, [Rerender,SearchDate]);
  


  const onSelectDate = (date, dateString) => {
    setSearchDate(getFormatDate(date._d))
  }
  const disabledDate = (current) => {
    return current && current > moment();
  }
  
    const columns = [
      {
        title: '이용일',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
        render: data => data ? data.full_ : '',
      },
      {
        title: '작성일',
        dataIndex: 'timestamp',
        key: 'timestamp',
        align: 'center',
        render: data => data ? getFormatDate(new Date(data)).full_ : '',
      },
      {
        title: '소속',
        dataIndex: 'sosok',
        key: 'sosok',
        align: 'center',
        render: data => {
          let txt
          if(data == 1){
            txt = "미트리";
          }
          if(data == 2){
            txt = "푸드킹";
          }
          if(data == 3){
            txt = "계약직";
          }
          return txt
        }
      },
      {
        title: '부서',
        dataIndex: 'part',
        key: 'part',
        align: 'center',
      },
      {
        title: '이름',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
      },
      {
        title: '이용자와의 관계',
        dataIndex: 'relation',
        key: 'relation',
        align: 'center',
      },
      {
        title: '서비스명',
        dataIndex: 'service',
        key: 'service',
        align: 'center'
      },
      {
        title: '가격',
        dataIndex: 'price',
        key: 'price',
        align: 'center',
        render: data => data ? `${commaNumber(data)}` : ''
      },
      {
        title: '서명',
        dataIndex: 'signature',
        key: 'signature',
        align: 'center',
        render: data => data ? <img style={{height:"40px"}} src={data} /> : '',
      }
      
    ]
    
  return (
    <>
      
      {MyHairData &&
        <>
          <DatePicker 
            picker="month"
            defaultValue={moment()}
            disabledDate={disabledDate} onChange={onSelectDate} 
            style={{marginTop:"20px",marginBottom:"10px"}}
          />
          <Table 
          pagination={{
            pageSize:10
          }}
          align="center" columns={columns} dataSource={MyHairData} 
          footer={() => (
            <>
              <div style={{textAlign:"center",fontWeight:"600"}}>가격 합계 : {commaNumber(TotalPrice)}원</div>
            </>
          )}
          /> 
  
        </>
      } 

    </>
  )
}

export default HairAdmin
