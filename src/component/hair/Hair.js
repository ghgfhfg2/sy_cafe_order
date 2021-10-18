import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { useSelector } from "react-redux";
import { Form, DatePicker, Input, Button, Table, Select, message } from 'antd';
import Signature from "../Signature";
import { getFormatDate, commaNumber } from '../CommonFunc';
import uuid from "react-uuid";
import moment from 'moment';
import { OderModalPopup } from "../OrderModal";
const curDate = getFormatDate(new Date());
const { RangePicker } = DatePicker;
const { Option } = Select;

function Hair() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [sigPadData, setSigPadData] = useState(null);
  const [MyHairData, setMyHairData] = useState();
  const [Rerender, setRerender] = useState(false);
  const [SearchDate, setSearchDate] = useState([curDate,curDate]);

  const [HairInfo, setHairInfo] = useState();

  useEffect(() => {

    firebase.database().ref('hair/info')
    .on('value', (snapshot) => {
      setHairInfo(snapshot.val())        
    });

    let hairArr = [];
    let startDate = SearchDate[0].full.substr(0,6);
    let endDate = SearchDate[1].full.substr(0,6);
    firebase
    .database()
    .ref(`hair/list/${userInfo.uid}`)
    .once("value", (snapshot) => {
      snapshot.forEach(el=>{
        let str = el.val().date.full.toString().substr(0,6);
        if(startDate <= str && str <= endDate){
          hairArr.push(el.val())
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
  
  const onSigpad = (data) => {
    setSigPadData(data);
  }

  const onFinish = (values)=> {
    const uid = uuid();
    values.date = getFormatDate(values.date._d);
    values.signature = sigPadData;
    console.log(sigPadData)
    if(!values.signature){
      window.alert('서명은 필수입니다.');
      return;
    }else if(values.signature.length < 2000){
      window.alert('서명이 너무 짧습니다.');
      return;
    }
    const yearMonth = String(values.date.year) + String(values.date.month)
    firebase.storage().ref(`hair/${yearMonth}/${uid}`)
    .putString(values.signature,'data_url')
    .then((res)=>{
      res.ref.getDownloadURL()
      .then(url => {
        firebase
        .database()
        .ref("hair/list")
        .child(`${userInfo.uid}/${uid}`)
        .update({
          ...values,
          signature:url,
          part: userInfo.photoURL,
          name: userInfo.displayName,
          sosok: userInfo.sosok,
          timestamp: new Date().getTime(),
          uid:uid,
          user_uid:userInfo.uid
        })
        setRerender(!Rerender);
        message.success('등록되었습니다.');
      })
    })
  }

  const onDelete = (uid,date) => {
    let yearMonth = getFormatDate(new Date(date));
    yearMonth = String(yearMonth.year) + String(yearMonth.month)

    let curDate = Math.floor(new Date().getTime()/1000);
    let thisDate = Math.floor(date/1000);
    if(curDate>thisDate+259200){
      window.alert('삭제는 작성 후 3일까지 가능합니다.');
      return;
    }
    let agree = window.confirm('삭제하면 복구가 불가능합니다. 삭제하시겠습니까?');
    if(agree){
      firebase.database().ref(`hair/list/${userInfo.uid}/${uid}`).remove();
      setRerender(!Rerender)
      firebase.storage().ref(`hair/${yearMonth}/${uid}`).delete()
      message.success('삭제되었습니다.');
    }
  }

  const [ModifyPop, setModifyPop] = useState(false);
  const [ModifyData, setModifyData] = useState();
  const onModify = (uid,date) => {
    firebase.database().ref(`hair/list/${userInfo.uid}/${uid}`)
    .once("value", (snapshot => {
      setModifyData(snapshot.val());
      return;
    }))
    let curDate = Math.floor(new Date().getTime()/1000);
    let thisDate = Math.floor(date/1000);
    if(curDate>thisDate+259200){
      window.alert('수정은 작성 후 3일까지 가능합니다.');
      return;
    }
    setModifyPop(true)
  }
  const modifyOff = () => {
    setModifyData('');
    setModifyPop(false)
  }

  const onSubmitModify = (e) => {
    e.preventDefault();
    let date = e.target.date.value;
    let year = date.substr(0,4);
    let month = date.substr(5,2);
    month = parseInt(month) - 1;
    let day = date.substr(8,2);
    date = getFormatDate(new Date(year,month,day))
    firebase
    .database()
    .ref("hair/list")
    .child(`${userInfo.uid}/${ModifyData.uid}`)
    .update({
      date:date,
      price: e.target.price.value,
      relation: e.target.querySelector('.ant-select-selection-item').title,
      service: e.target.service.value,
    });
    setRerender(!Rerender)
    modifyOff()
    message.success('수정되었습니다.');
  }

  const onSelectDate = (date, dateString) => {
    let arr = [];
    arr.push(getFormatDate(date[0]._d))
    arr.push(getFormatDate(date[1]._d))
    setSearchDate(arr)
  }
  const disabledDate = (current) => {
    return current && current > moment();
  }


  
    const columns = [
      {
        title: '이용날짜',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
        render: data => data ? data.full_ : '',
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
      },
      {
        title: '관리',
        dataIndex: ['uid','timestamp'],
        key: 'uid',
        align: 'center',
        render: (text,row) => row['uid'] ? (
          <>
            <Button style={{marginRight:"5px"}} onClick={()=>{onModify(row['uid'],row['timestamp'])}}>수정</Button>
            <Button onClick={()=>{onDelete(row['uid'],row['timestamp'])}}>삭제</Button>
          </>
          ) : '',
      }
      
    ]


    
  return (
    <>
      {HairInfo && 
          <div className="item-info-box" style={{marginBottom:"20px"}}>
            <pre>{HairInfo}</pre>
          </div>
        }
      <Form name="dynamic_form_nest_item" className="hiar-form" onFinish={onFinish} autoComplete="off">
        <div className="flex-box">
          <Form.Item 
          name="date"
          label="이용날짜"
          rules={[{ 
            required: true,
            message: "필수항목 입니다."
          }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item 
          name="relation"
          label="관계"
          rules={[{ 
            required: true,
            message: "필수항목 입니다."
          }]}
          >
            <Select defaultValue="선택" style={{ width: 120 }}>
              <Option value="본인">본인</Option>
              <Option value="배우자">배우자</Option>
              <Option value="자녀">자녀</Option>
            </Select>
          </Form.Item>
        </div>
        <div className="flex-box">
          <Form.Item 
          name="service"
          label="서비스명"
          rules={[{ 
            required: true,
            message: "필수항목 입니다."
          }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
          name="price"
          label="가격"
          rules={[{ 
            required: true,
            message: "필수항목 입니다."
          }]}
          >
            <Input 
              prefix="￦" 
              type="number"
              style={{maxWidth:"120px"}} 
            />
          </Form.Item>
        </div>
        <Form.Item 
        className="signature"
        name="signature"
        label="서명"
        >
          <Signature onSigpad={onSigpad} />
        </Form.Item>
        <div className="btn-box">
          <Button type="primary" htmlType="submit">등록하기</Button>          
        </div>
      </Form>

      {MyHairData &&
        <>
        <RangePicker 
          picker="month" 
          style={{margin:"20px 0 10px 0"}}
          defaultValue={[moment(),moment()]}
          disabledDate={disabledDate} onChange={onSelectDate}
        />
        <Table 
        pagination={{
          pageSize:10
        }}
        align="center" columns={columns} dataSource={MyHairData} />        
        </>
      } 
      {
        ModifyPop && ModifyData &&
        <>
          <OderModalPopup className="call_modify" style={{
            top:"50%",
            left:"50%",
            transform:"translate(-50%,-50%)",
            position:"fixed",
          }}>
            <form className="order-form-box" onSubmit={onSubmitModify}>
              <div className="input-box" style={{marginBottom:"5px"}}>
                <span className="tit">이용날짜</span>
                <DatePicker name="date" defaultValue={moment(ModifyData.date.full_)} />
              </div>
              <div className="input-box" style={{marginBottom:"5px"}}>
                <span className="tit">관계</span>
                <Select name="relation" defaultValue={ModifyData.relation} style={{ width: 120 }}>
                  <Option value="본인">본인</Option>
                  <Option value="배우자">배우자</Option>
                  <Option value="자녀">자녀</Option>
                </Select>
              </div>
              <div className="input-box" style={{marginBottom:"5px"}}>
                <span className="tit">서비스명</span>
                <Input name="service" defaultValue={ModifyData.service} />
              </div>
              <div className="input-box" style={{marginBottom:"5px"}}>
                <span className="tit">가격</span>
                <Input prefix="￦" type="number" name="price" defaultValue={ModifyData.price} />
              </div>
              <div className="btn-box">
                <Button type="primary" htmlType="submit">수정하기</Button>
                <Button onClick={modifyOff} style={{marginLeft:"5px"}}>닫기</Button>
              </div>
            </form>
          </OderModalPopup>
        </>
      }
    </>
  )
}

export default Hair
