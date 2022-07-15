import React, { useEffect, useState } from "react";
import { Button, Input, Checkbox, Spin, Select,message } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import moment from "moment";
import { getFormatDate, getAbleTime } from "./CommonFunc";
import "moment/locale/ko";
import uuid from "react-uuid";
export const OderModalPopup = styled.div`
  width: auto;
  min-width:290px;
  padding: 20px;
  border: 1px solid #ddd;
  position: absolute;
  z-index: 150;
  border-radius: 10px;
  background: #fff;
  transform: translate(-50%, -70%);
  left: ${(props) => props.posx}px;
  top: ${(props) => props.posy}px;
  animation: fade_up 0.3s both;
  box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.25);
  .modal-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  @keyframes fade_up {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -70%);
    }
  }  
  @media all and (max-width: 640px) {
    width: 80%;
    max-width: 300px;
    left: 50%;
    transform: translate(-50%, -100%);
  }
  .num {
    width: 40px;
    text-align: center;
    margin: 0 -1px;
  }
  .tit {
    display: inline-block;
    margin-right: 5px;
    flex-shrink: 0;
  }
  .btn-box {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    button {
      width: 100px;
    }
  }
`;
const { Option } = Select;

function OrderModal({ posx, posy, onFinished, OrderItem }) {

  const [saleTime, setSaleTime] = useState();
  const userInfo = useSelector((state) => state.user.currentUser);
  const [UserDb, setUserDb] = useState();
  const [UserPhone, setUserPhone] = useState();

  const [ableTimeState, setAbleTimeState] = useState();

  useEffect(() => {
    if(OrderItem.time_sale){
      let timeTemp = [];
      OrderItem.time_sale.forEach(el=>{
        let temp = [];
        el.forEach(e=>{
          temp.push(e.split(":").slice(0,2).join(":"))
        })
        timeTemp.push(temp);
      })
      const curTime = getFormatDate(new Date());   
      const ableTimeCheck =  getAbleTime(OrderItem.time_sale,curTime);
      setAbleTimeState(ableTimeCheck.ableTime);
      setSaleTime(timeTemp);
    }
  }, [OrderItem])
  
  useEffect(() => {

    if (userInfo) {
      firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .once("value", (snapshot) => {
        setUserDb(snapshot.val());
      });
    }
    firebase
    .database()
    .ref(`users/${userInfo.uid}`)
    .once("value")
    .then((snapshot) => {            
      setUserPhone(snapshot.val().call_number)
    });
  }, [])
  const [Amount, setAmount] = useState(1);
  const plusAmount = () => {
    if (Amount < 10) {
      setAmount((pre) => pre + 1);
    } else {
      alert("최대 주문량은 10개 입니다.");
    }
  };
  const minusAmount = () => {
    if (Amount > 1) {
      setAmount((pre) => pre - 1);
    } else {
      alert("최소 주문량은 1개 입니다.");
    }
  };
  const onCancel = () => {
    onFinished();
  };

  const [radioValue, setradioValue] = useState();
  const radioChange = (e) => {
    setradioValue(e.target.value);
  };
  const [radioValue2, setradioValue2] = useState('저지방');
  const radioChange2 = (e) => {
    setradioValue2(e.target.value);
  };  

  const [AddCheck, setAddCheck] = useState();
  function onChange(checkedValues) {
    setAddCheck(checkedValues);
  }

  const [AddCheck2, setAddCheck2] = useState();
  function onChange2(checkedValues) {
    setAddCheck2(checkedValues);
  }

  let hotRadio;
  if (OrderItem.hot === "hot & ice") {
    hotRadio = (
      <>
        <input
          type="radio"
          name="hot"
          id="hot"
          value="hot"
          onChange={radioChange}
        />
        <label className="radio_hot" htmlFor="hot">
          hot
        </label>
        <input
          type="radio"
          id="ice"
          name="hot"
          value="ice"
          onChange={radioChange}
        />
        <label className="radio_ice" htmlFor="ice">
          ice
        </label>
      </>
    );
  }
  if (OrderItem.hot === "hot only") {
    hotRadio = (
      <>
        <input
          type="radio"
          id="hot"
          name="hot"
          value="hot"
          checked
          onChange={radioChange}
        />
        <label className="radio_hot" htmlFor="hot">
          hot only
        </label>
      </>
    );
  }
  if (OrderItem.hot === "ice only") {
    hotRadio = (
      <>
        <input
          type="radio"
          id="ice"
          name="hot"
          value="ice"
          checked
          onChange={radioChange}
        />
        <label className="radio_ice" htmlFor="ice">
          ice only
        </label>
      </>
    );
  }

  // submit
  const [ProdOption, setProdOption] = useState();
  const onOptionChange = (e) => {
    setProdOption(e);
  }
  useEffect(()=>{
    setProdOption('')
  },[OrderItem])
  const [submitLoading, setsubmitLoading] = useState(false);
  const onSubmitOrder = async (e) => {
    e.preventDefault();  
    const nowTime = moment().format("YYYY-MM-DD HH:mm:ss|dddd");
    const timeStamp = new Date().getTime();
    const curTime = getFormatDate(new Date());    
    if(OrderItem.time_sale){
      const ableTimeCheck =  getAbleTime(OrderItem.time_sale,curTime)
      if(!ableTimeCheck.ableTime){
        message.error(`주문불가 시간 입니다.`)
        return
      }
    }
    let guest_call = '';
    if(e.target.guest_call){
      guest_call = e.target.guest_call.value;
    }
    
    if(userInfo?.auth && userInfo.auth.includes('disable')){
      message.error("주문이 불가능 합니다.")
      return;
    }    
    if(OrderItem.jaego === 0){
      message.error("재고가 부족합니다.")
      return
    }
    if(OrderItem.option && !ProdOption){
      message.error("옵션을 선택해 주세요")
      return;
    }
       
    setsubmitLoading(true);
    
    if(OrderItem.limit && UserDb.limit){
      if(UserDb.limit.hasOwnProperty(OrderItem.name)){
        let time = UserDb.limit[OrderItem.name].timestamp
        time = getFormatDate(new Date(time));        
        if(curTime.full === time.full){
          message.error("하루에 한번만 주문 가능합니다.");
          onFinished();
          setsubmitLoading(false);
          return;
        }else{
          firebase
          .database()
          .ref("users")
          .child(`${userInfo.uid}/limit/${OrderItem.name}`)
          .update({
            timestamp:timeStamp,      
          })
        } 
      }else{
        firebase
        .database()
        .ref("users")
        .child(`${userInfo.uid}/limit/${OrderItem.name}`)
        .update({
          timestamp:timeStamp,      
        })  
      }
    }else if(OrderItem.limit){
      firebase
      .database()
      .ref("users")
      .child(`${userInfo.uid}/limit/${OrderItem.name}`)
      .update({
        timestamp:timeStamp,      
      })           
    }

    if (e.target.hot && !e.target.hot.value) {
        message.error("온도를 선택해주세요");
        setsubmitLoading(false);
        return;
    }
    let addPrice = 0;

    if (AddCheck2) {
      if (AddCheck2.includes("샷1")) {
        addPrice += 500;
      }
      if (AddCheck2.includes("샷2")) {
        addPrice += 1000;
      }
    }
    if (AddCheck) {
      addPrice += 500;
    }
    let values = {
      order_uid: userInfo.uid,
      order_email: userInfo.email,
      order_name: userInfo.displayName,
      order_part: userInfo.photoURL,
      order_time: nowTime,
      order_etc: e.target.etc.value,
      order_state: 0,
      order_phone:guest_call ? guest_call : UserPhone,
      prod_uid: OrderItem.uid,
      prod_name: OrderItem.name,
      prod_option: ProdOption ? ProdOption : "",
      prod_img: OrderItem.image,
      price: OrderItem.price * e.target.amount.value + addPrice,
      amount: parseInt(e.target.amount.value),
      kal: parseInt(OrderItem.kal),
      hot: e.target.hot ? e.target.hot.value : "",
      milk: e.target.milk ? e.target.milk.value : "",
      add: AddCheck ? AddCheck : null,
      add2: AddCheck2 ? AddCheck2 : null,
      category: OrderItem.category,
      timestamp: timeStamp,      
    };


    try {
      await firebase
      .database()
      .ref("products")
      .child(`${OrderItem.uid}`)
      .transaction((pre) => {
        if(pre.jaego){
          pre.jaego--;
          return pre;
        }
      });
      await firebase
        .database()
        .ref("products")
        .child(`${OrderItem.uid}/count`)
        .transaction((pre) => {
          return pre + 1;
        });
      await firebase
        .database()
        .ref("users")
        .child(`${userInfo.uid}/favorite/${OrderItem.name}`)
        .child("count")
        .transaction((pre) => {
          return pre + 1;
        });
       
      await firebase
        .database()
        .ref("order")
        .child(uuid())
        .set({
          ...values,
        });
      await firebase
        .database()
        .ref("order_count")
        .transaction((pre) => {
          return pre + 1;
        });
        message.success('주문에 성공했습니다 :)');  
      onFinished();
      setsubmitLoading(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <OderModalPopup
        className="ani-fadein du-1"
        posx={posx}
        posy={posy}
        style={{ padding: "12px 15px 15px 15px" }}
      >
        <form className="order-form-box" onSubmit={onSubmitOrder}>
          <h4>{OrderItem.name}</h4>
          {OrderItem.time_sale && saleTime?.length > 0 &&
          <div className="sale-time">
            <h5>판매시간</h5>
            <div className="alble-time-check">
            {ableTimeState ? (<span className="able">(주문가능)</span>) : (<span className="disable">(주문불가)</span>)
            }
            </div>
            <div className="time">
            {saleTime.map(el=>(
              <div>{el.join('~')}</div>
            ))}
            </div>
          </div>
          }
          <div className="flex-box a-center">
            <span className="tit">수량</span>
            {/* <Button
              onClick={minusAmount}
              icon={<MinusOutlined />}
              type="default"
            ></Button> */}
            <Input className="num" name="amount" style={{border:"none"}} value={Amount} />
            {/* <Button
              onClick={plusAmount}
              icon={<PlusOutlined />}
              type="default"
            ></Button> */}
          </div>
          {OrderItem.option &&
          <div className="flex-box a-center">
            <span className="tit">옵션</span>
            <Select onChange={onOptionChange} name="option" style={{width:"100%"}}>
            {OrderItem.option.split(',').map((el,idx) => (
              <Option value={el} key={idx}>{el}</Option>
            ))}
            </Select>
          </div>
          }
          {hotRadio &&
          <div className="flex-box a-center">
            <span className="tit"></span>
            {hotRadio}
          </div>
          }
            {OrderItem.milk &&
            <div className="flex-box a-center">
              <span className="tit"></span>
                    
              {/* {OrderItem.m_soldout && (
                  <>
                  <input
                    type="radio"
                    id="none"
                    name="milk"
                    value="무지방"
                    onChange={radioChange2}
                  />
                  <label htmlFor="none">
                  무지방
                  </label>
                </>
              )} */}
              {OrderItem.m_soldout2 && (
                <>
                  <input
                    type="radio"
                    id="free"
                    name="milk"
                    value="락토프리"
                    defaultChecked
                    onChange={radioChange2}
                  />
                  <label htmlFor="free">
                  락토프리
                  </label>
                </>
              )}
              {OrderItem.m_soldout && (
              <>
                <input
                  type="radio"
                  name="milk"
                  id="basic"
                  value="저지방"   
                  onChange={radioChange2}
                  />
                  <label htmlFor="basic">
                  저지방
                </label>
              </>
              )}
            </div>
            }
          {OrderItem.add && (
            <div className="flex-box">
              <span className="tit" style={{ marginTop: "3px" }}>
                추가
              </span>
              {OrderItem && (
                <div
                  className="order-check-box"
                  style={{ flexDirection: "column" }}
                >
                  {/* <Checkbox.Group style={{ width: "100%" }} onChange={onChange}>
                    {OrderItem.b_soldout && OrderItem.add.includes("버블") && (
                      <>
                        <Checkbox value="버블">버블</Checkbox>
                      </>
                    )}
                    {!OrderItem.b_soldout && OrderItem.add.includes("버블") && (
                      <>
                        <Checkbox value="버블" disabled>
                          버블품절
                        </Checkbox>
                      </>
                    )}
                  </Checkbox.Group> */}
                  {OrderItem.add.includes("샷") && (
                    <>
                      <div
                        className="flex-box a-center"
                        style={{ marginTop: "5px" }}
                      >
                        <Checkbox.Group style={{ width: "100%" }} onChange={onChange2}>                          
                          {OrderItem.add.includes("연하게") && (        
                              <Checkbox value="연하게">연하게</Checkbox>
                          )}
                          <Checkbox value="샷1">1샷 추가</Checkbox>
                          <Checkbox value="샷2">2샷 추가</Checkbox>
                        </Checkbox.Group>                        
                      </div>
                    </>
                  )}                  
                </div>
              )}
            </div>
          )}
          <div className="flex-box a-center">
            <span className="tit">기타</span>
            <Input name="etc" type="text" />
          </div>
          {userInfo && userInfo.uid === 'cz8emz5BbZMkdJLTSEmro6DYqF32' &&
            <div className="flex-box a-center">
              <div>
                <span>주문알림용 연락처(선택)</span>
                <Input name="guest_call" type="number" placeholder={`휴대폰번호 ('-' 빼고 입력해 주세요)`} />
              </div>
            </div>
          }
          <div className="btn-box">
            <Button
              disabled={submitLoading}
              htmlType="submit"
              type="primary"
              style={{ marginRight: "5px" }}
            >
              주문
            </Button>
            <Button onClick={onCancel} type="default">
              취소
            </Button>
          </div>
        </form>
        {submitLoading && (
          <>
            <div
              className="bg-box"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                background: "rgba(255,255,255,0.5)",
                borderRadius: "10px",
              }}
            ></div>
            <Spin className="modal-loading" tip="Loading..."></Spin>
          </>
        )}
      </OderModalPopup>
    </>
  );
}

export default OrderModal;
