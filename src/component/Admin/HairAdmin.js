import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { useSelector } from "react-redux";
import { Input, DatePicker, Button, Table, Radio, Select, message } from 'antd';
import * as antIcon from "react-icons/ai";
import { getFormatDate, commaNumber } from '../CommonFunc';
import moment from 'moment';
import { OderModalPopup } from "../OrderModal";
import { CSVLink } from "react-csv";
import _ from 'lodash';
const curDate = getFormatDate(new Date());
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

function HairAdmin() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [MyHairData, setMyHairData] = useState();
  const [MetreeData, setMetreeData] = useState();
  const [FoodkingData, setFoodkingData] = useState();
  const [MeureData, setMeureData] = useState();
  const [Rerender, setRerender] = useState(false);
  const [SearchDate, setSearchDate] = useState([curDate,curDate]);

  const [TotalPrice, setTotalPrice] = useState(0);
  const [MeTotalPrice, setMeTotalPrice] = useState(0);
  const [FdTotalPrice, setFdTotalPrice] = useState(0);
  const [ErTotalPrice, setErTotalPrice] = useState(0);
  const [TypeTotalPrice, setTypeTotalPrice] = useState(0);

  const [PersnalData, setPersnalData] = useState();
  const [TotalPersnalData, setTotalPersnalData] = useState();
  const [MePersonalData, setMePersonalData] = useState();
  const [FdPersonalData, setFdPersonalData] = useState();
  const [ErPersonalData, setErPersonalData] = useState();

  const [HairData, setHairData] = useState();

  const [CheckInfoTxt, setCheckInfoTxt] = useState(null);
  
  const excelHeaders = [
    {label: "이용일", key:"date"},
    {label: "작성일", key:"timestamp"},
    {label: "소속", key:"sosok"},
    {label: "부서", key:"part"},
    {label: "이름", key:"name"},
    {label: "이용자와의관계", key:"relation"},
    {label: "서비스명", key:"service"},
    {label: "가격", key:"price"}
  ]
  const [excelData, setExcelData] = useState()
  const [excelDataCopy, setExcelDataCopy] = useState()
  useEffect(() => {
    firebase.database().ref('hair/info')
      .on('value', (snapshot) => {
        setCheckInfoTxt(snapshot.val())        
    });

    let hairArr = [];
    let totalPrice = 0;    
    let meTotalPrice = 0;    
    let fdTotalPrice = 0;    
    let erTotalPrice = 0;    
    let personalArr = [];
    let startDate = SearchDate[0].full.substr(0,6);
    let endDate = SearchDate[1].full.substr(0,6);
    firebase
    .database()
    .ref(`hair/list`)
    .once("value", (snapshot) => {
      snapshot.forEach(el=>{
        let obj = el.val();
        let personalObj = {};
        let personalPrice = 0;
        let dateArr = [];
        let relArr = [];
        let serArr = [];
        let priceArr = [];
        for (let key in obj) {
          let name = obj[key].name;
          let str = obj[key].date.full.toString().substr(0,6);
          if(startDate <= str && str <= endDate){
            personalPrice += parseInt(obj[key].price);
            totalPrice += parseInt(obj[key].price);
            if(obj[key].sosok === '1'){
              meTotalPrice += parseInt(obj[key].price);
            }
            if(obj[key].sosok === '2'){
              fdTotalPrice += parseInt(obj[key].price);
            }
            if(obj[key].sosok === '3'){
              erTotalPrice += parseInt(obj[key].price);
            }
            obj[key].distance =  obj[key].timestamp - new Date(`${obj[key].date.full_} ${obj[key].date.hour}:${obj[key].date.min}`).getTime();
            obj[key].distance = Math.floor(obj[key].distance/1000/60/60/24)
            dateArr.push(obj[key].date)
            // dateArr.sort((a,b)=>{
            //   return a.full - b.full
            // })
            relArr.push(obj[key].relation)
            serArr.push(obj[key].service)
            priceArr.push(obj[key].price)            
            personalObj = {
              date : dateArr,
              name : name,
              part : obj[key].part,
              sosok : obj[key].sosok,
              timestamp : obj[key].timestamp,
              relation : relArr, 
              service : serArr, 
              price : priceArr, 
              total_price: personalPrice,
            }
            hairArr.push(obj[key]);
          }
        }
        personalArr.push(personalObj);
        setPersnalData(personalArr);
        setTotalPersnalData(personalArr);
        let mePersnalArr = personalArr.concat().filter(el=>{
          return el.sosok === '1';
        });
        let fdPersnalArr = personalArr.concat().filter(el=>{
          return el.sosok === '2';
        });
        let erPersnalArr = personalArr.concat().filter(el=>{
          return el.sosok === '3';
        });
        setMePersonalData(mePersnalArr);
        setFdPersonalData(fdPersnalArr);        
        setErPersonalData(erPersnalArr);        
        setTotalPrice(totalPrice);
        setTypeTotalPrice(totalPrice);
        setMeTotalPrice(meTotalPrice);
        setFdTotalPrice(fdTotalPrice);
        setErTotalPrice(erTotalPrice);
      })      
      hairArr.sort((a,b)=>{
        return b.date.full - a.date.full
      })
      setMyHairData(hairArr);
      setHairData(hairArr);
      let metreeArr = hairArr.concat().filter(el => {
        return el.sosok === '1'
      });
      setMetreeData(metreeArr);
      let foodkingArr = hairArr.concat().filter(el => {
        return el.sosok === '2'
      })
      setFoodkingData(foodkingArr);
      let meureArr = hairArr.concat().filter(el => {
        return el.sosok === '3'
      })
      setMeureData(meureArr);

      let excelArr = _.cloneDeep(hairArr).map(el => {
        el.date = el.date.full_;
        el.timestamp = getFormatDate(new Date(el.timestamp)).full_;
        el.price = commaNumber(el.price);
        el.sosok = el.sosok == 1 ? "미트리" : el.sosok == 2 ? "푸드킹" : "미에르"
        el.signature = "";
        el.uid = "";
        el.user_uid = "";
        return el;
      });      
      setExcelData(excelArr)
      setExcelDataCopy(excelArr)

    });
    return () => {
      firebase.database().ref(`users/${userInfo.uid}`).off();
      firebase.database().ref('hair/info').off();
    }
  }, [Rerender,SearchDate]);
  

  const onDelete = (uid,date,user_uid) => {
    let curDate = getFormatDate(new Date());
    let thisDate = getFormatDate(new Date(date));
    let year = thisDate.year;
    let month = thisDate.og_month;
    let day = thisDate.og_day;
    month++;
    day = 15;
    if(month === 12){
      month = 0;
      year++;
    }
    thisDate = getFormatDate(new Date(year,month,day));
    if(curDate.full>thisDate.full){
      window.alert('삭제는 작성일 기준 익월 15일까지 가능합니다.');
      return;
    }
    let agree = window.confirm('삭제하면 복구가 불가능합니다. 삭제하시겠습니까?');
    if(agree){
      firebase.database().ref(`hair/list/${user_uid}/${uid}`).remove();
      setRerender(!Rerender)
    }
  }

  const [ModifyPop, setModifyPop] = useState(false);
  const [ModifyData, setModifyData] = useState();
  const onModify = (uid,date,user_uid) => {
    firebase.database().ref(`hair/list/${user_uid}/${uid}`)
    .once("value", (snapshot => {
      setModifyData(snapshot.val());
      return;
    }))
    let curDate = getFormatDate(new Date());
    let thisDate = getFormatDate(new Date(date));
    let year = thisDate.year;
    let month = thisDate.og_month;
    let day = thisDate.og_day;
    month++;
    day = 15;
    if(month === 12){
      month = 0;
      year++;
    }
    thisDate = getFormatDate(new Date(year,month,day));
    if(curDate.full>thisDate.full){
      window.alert('수정은 작성일 기준 익월 15일까지 가능합니다.');
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
    .child(`${ModifyData.user_uid}/${ModifyData.uid}`)
    .update({
      date:date,
      price: e.target.price.value,
      relation: e.target.querySelector('.ant-select-selection-item').title,
      service: e.target.service.value,
    });
    setRerender(!Rerender)
    modifyOff()
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

  const [sosokType, setsosokType] = useState('1')
  const onSosokChange = (e) => {
    let excelArr = excelDataCopy;
    const type = e.target.value;
    setsosokType(type);
    if(type === '1'){      
      setHairData(MyHairData);
      setTypeTotalPrice(TotalPrice);
      setPersnalData(TotalPersnalData);
    }
    if(type === '2'){
      excelArr = excelArr.filter(el => el.sosok === '미트리');
      setHairData(MetreeData);
      setTypeTotalPrice(MeTotalPrice);
      setPersnalData(MePersonalData);
    }
    if(type === '3'){
      excelArr = excelArr.filter(el => el.sosok === '푸드킹');
      setHairData(FoodkingData);
      setTypeTotalPrice(FdTotalPrice);
      setPersnalData(FdPersonalData);
    }
    if(type === '4'){
      excelArr = excelArr.filter(el => el.sosok === '미에르');
      setHairData(MeureData);
      setTypeTotalPrice(ErTotalPrice);
      setPersnalData(ErPersonalData);
    }
    setExcelData(excelArr);
    


  }
  
    const columns = [
      {
        title: '이용일',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
        sorter: {
          compare: (a, b) => a.date.full - b.date.full,
          multiple: 3,
        },
        render: data => data ? data.full_ : '',
      },
      {
        title: '작성일',
        dataIndex: 'date,timestamp',
        key: 'timestamp',
        align: 'center',
        sorter: {
          compare: (a, b) => a.timestamp - b.timestamp,
          multiple: 2,
        },
        render: (text,row) => row['distance'] > 4 ? <span style={{background:"#e12424",color:"#fff"}}>{getFormatDate(new Date(row['timestamp'])).full_}</span> : (
          <>
          {getFormatDate(new Date(row['timestamp'])).full_}
          </>
          ),
      },
      {
        title: '소속',
        dataIndex: 'sosok',
        key: 'sosok',
        align: 'center',
        sorter: {
          compare: (a, b) => a.sosok - b.sosok,
          multiple: 1,
        },
        render: data => {
          let txt
          if(data == 1){
            txt = "미트리";
          }
          if(data == 2){
            txt = "푸드킹";
          }
          if(data == 3){
            txt = "미에르";
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
        render: data => data ? `${commaNumber(data)}원` : ''
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
        dataIndex: ['uid','timestamp','user_uid','date'],
        key: 'uid',
        align: 'center',
        render: (text,row) => row['uid'] ? (
          <>
            <Button style={{marginRight:"5px"}} onClick={()=>{onModify(row['uid'],row['timestamp'],row['user_uid'])}}>수정</Button>
            <Button onClick={()=>{onDelete(row['uid'],row['timestamp'],row['user_uid'])}}>삭제</Button>            
          </>
          ) : '',
      }
      
    ]

   
    const onSubmit = async (e) => {
      e.preventDefault();
      try {
        firebase.database().ref('hair')
        .update({
          info:e.target.check_info_txt.value
        })
        .then(res => {
          message.success("저장되었습니다.")
        })
      }catch (error) {
        console.error(error);
      }
    }

    
    
  return (
    <>
      <form onSubmit={onSubmit}>
      <h3 className="title" style={{ margin: "15px 0 5px 0" }}>
        공지사항
      </h3>
      <div className="flex-box">
        {CheckInfoTxt &&
          <TextArea name="check_info_txt" defaultValue={CheckInfoTxt} />  
        }
        {!CheckInfoTxt &&
          <TextArea name="check_info_txt" defaultValue="" /> 
        }
        <Button
          htmlType="submit"
          type="primary"
          size="large" 
          style={{flex:"1",marginLeft:"10px",height:"auto"}}               
        >
          저장
        </Button>
      </div>
      </form>
      
      <RangePicker 
        picker="month" 
        style={{marginTop:"20px"}}
        defaultValue={[moment(),moment()]}
        disabledDate={disabledDate} onChange={onSelectDate}
      />
      <Radio.Group value={sosokType} onChange={onSosokChange} style={{ marginBottom: 16,marginLeft:"10px" }}>
        <Radio.Button value="1">전체</Radio.Button>
        <Radio.Button value="2">미트리</Radio.Button>
        <Radio.Button value="3">푸드킹</Radio.Button>
        <Radio.Button value="4">미에르</Radio.Button>
      </Radio.Group>
      <h3 className="title">개인별 합계</h3>
      {PersnalData &&
        <table className="fl-table" style={{marginBottom:"20px",width:"25%"}}>
          <thead>
            <tr style={{borderBottom:'1px solid #ddd',borderTop:'2px solid #555'}}>
              <th scope="col">이름</th>
              <th scope="col">합계</th>
            </tr>
          </thead>
          <tbody>
          {PersnalData && PersnalData.map((el) => (
            <>
              {el.date && el.date.map((list,_idx) => (
                <>                      
                  <tr key={_idx} style={{borderBottom:'1px solid #ddd'}}>
                    {_idx == 0 &&
                    <th scope="row" rowSpan={el.date.length} style={{background:'#f1f1f1'}}>
                      {el.name}
                    </th>
                    }
                    {_idx == 0 &&
                    <>
                      <th scope="row" rowSpan={el.date.length}>
                        {commaNumber(el.total_price)}
                      </th>
                    </>
                    }
                  </tr>
                </>
              ))}     
            </>
          ))
          }
          </tbody>
        </table>
      }

      <h3 className="title">개인별 내역</h3>
      {PersnalData &&
        <table className="fl-table" style={{marginBottom:"20px"}}>
          <thead>
            <tr style={{borderBottom:'1px solid #ddd',borderTop:'2px solid #555'}}>
              <th scope="col">이름(소속/부서)</th>
              <th scope="col">이용일</th>
              <th scope="col">관계</th>
              <th scope="col">서비스</th>
              <th scope="col">가격</th>
              <th scope="col">총 이용횟수</th>
              <th scope="col">합계</th>
            </tr>
          </thead>
          <tbody>
          {PersnalData && PersnalData.map((el) => (
            <>
              {el.date && el.date.map((list,_idx) => (
                <>                      
                  <tr key={_idx} style={{borderBottom:'1px solid #ddd'}}>
                    {_idx == 0 &&
                    <th scope="row" rowSpan={el.date.length} style={{background:'#f1f1f1'}}>
                      {el.name}/
                      {el.sosok === '1' ? "미트리" :
                       el.sosok === '2' ? "푸드킹" : 
                       el.sosok === '3' ? "미에르" : "" 
                      }/
                      {el.part}
                    </th>
                    }
                    <td>{list.full_}</td>
                    <td>{el.relation[_idx]}</td>
                    <td> {el.service[_idx]}</td>
                    <td>{commaNumber(el.price[_idx])}</td>
                    {_idx == 0 &&
                    <>
                      <td rowSpan={el.date.length}>{el.date.length}회</td>
                      <th scope="row" rowSpan={el.date.length}>
                        {commaNumber(el.total_price)}
                      </th>
                    </>
                    }
                  </tr>
                </>
              ))}     
            </>
          ))
          }
          </tbody>
        </table>
      }
      <div className="flex-box" style={{marginBottom:"8px",marginTop:"25px"}}>
      <h3 className="title">전체 내역</h3>      
      {excelData &&
        <Button style={{marginLeft:"10px"}}>
          <CSVLink 
            headers={excelHeaders} 
            data={excelData} 
            filename={`metree-hair${curDate.full}.csv`} 
            target="_blank"
          >
            <antIcon.AiOutlineFileExcel style={{position:"relative",top:"3px",fontSize:"17px",marginRight:"3px"}} />전체내역 엑셀 다운로드
          </CSVLink>
        </Button>
        }
      </div>
      {MyHairData &&
        <>          
          <Table 
          size="small"
          pagination={{
            pageSize:20
          }}
          align="center" columns={columns} dataSource={HairData} 
          footer={() => (
            <>
              <div style={{textAlign:"center",fontWeight:"600"}}>가격 합계 : {commaNumber(TypeTotalPrice)}원</div>
            </>
          )}
          /> 

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

export default HairAdmin
