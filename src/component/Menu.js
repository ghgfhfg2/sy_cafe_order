import React, { useState, useEffect, useRef } from "react";
import firebase from "../firebase";
import { Link } from "react-router-dom";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import { commaNumber,getFormatDate } from "./CommonFunc";
import Loading from "./Loading";
import Timer from "./Timer";
import { Radio, Input, Empty, Button, Checkbox } from "antd";
import * as antIcon from "react-icons/ai";
import * as Hangul from "hangul-js";
import { useSelector } from "react-redux";
import GuestHome from "./GuestHome"
const { Search } = Input;
const _ = require("lodash");

const curDate = getFormatDate(new Date());
const curHourMin = ''+curDate.hour+curDate.min;

function Menu() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ProdItem, setProdItem] = useState([]);
  const [ProdItemCopy, setProdItemCopy] = useState();
  const lunchCheckBox = useRef();
  

  const [TimeOut, setTimeOut] = useState(false)
  const curSec = Math.floor(new Date().getTime()/1000);
  const endSec = Math.floor(new Date(curDate.year,curDate.og_month,curDate.og_day,9,30).getTime()/1000);
  const calcSec = endSec - curSec;
  const restMin = Math.floor(calcSec/60);
  const restSec = calcSec%60;

  const [GuestHomePop, setGuestHomePop] = useState(true);
  const guestPopClose = () => {
    setGuestHomePop(false)
  }
  const guestPopOn = () => {
    setGuestHomePop(true)
  }

  const onTimeOut = () => {
    setTimeOut(true);
  }

  
  //정렬 라디오버튼
  const [CateRadio, setCateRadio] = useState("all");
  const itemSort = (e) => {
    setCateRadio(e.target.value);
  };

  //검색
  const [searchInput, setSearchInput] = useState("");
  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
    if(e.target.value === ''){
      setSearchAgain(!SearchAgain);
    }
  };

  const [SearchAgain, setSearchAgain] = useState(false);
  const onSearch = () => {
    setSearchAgain(!SearchAgain);
  };

  const onToggleFavor = (e, name) => {
    e.currentTarget.classList.toggle("true");
    firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .child(`favorite/${name}/add_favor`)
      .transaction((pre) => {
        return !pre;
      });
  };

  let b_soldout;
  let m_soldout;
  let m_soldout2;

  const [TodayLunchCheck, setTodayLunchCheck] = useState();
  const [ItemList, setItemList] = useState();
  
  const [ModifyState, setModifyState] = useState(false)
  const onModify = () => {
    setModifyState(true)
  }
  useEffect(() => {
    if (userInfo) {
      
      //식단체크
      firebase.database().ref('lunch/item')
      .once('value', (snapshot) => {
        let arr = [];
        snapshot.forEach(el => {
          arr.push(el.val())
        })
        setItemList(arr)
      });
      let lunchCheck = {};
      firebase
      .database()
      .ref("lunch")
      .child(`user/${userInfo.uid}/checkList/${curDate.full}`)
      .once("value")
      .then((snapshot) => {
          if(snapshot.val()){
            lunchCheck.date = snapshot.val().date;
            lunchCheck.confirm = snapshot.val().confirm;
            lunchCheck.item = snapshot.val().item;
            setTodayLunchCheck(lunchCheck)
          }
      });
    }
    return () => {
    }
  }, [ModifyState])

  useEffect(() => {
    let mounted = true;
    if (mounted && userInfo) {

      //즐찾
      async function getProdItem() {
        let favorItem = [];
        await firebase
          .database()
          .ref("soldout")
          .once("value")
          .then((snapshot) => {            
            b_soldout = snapshot.val().b_soldout;
            m_soldout = snapshot.val().MilkSoldout;
            m_soldout2 = snapshot.val().MilkSoldout2;
          });
          
        await firebase
          .database()
          .ref("users")
          .child(`${userInfo.uid}/favorite`)
          .once("value")
          .then((snapshot) => {
            snapshot.forEach(function (item) {
              favorItem.push({
                name: item.key,
                add_favor: item.val().add_favor,
              });
            });
          });

        await firebase
          .database()
          .ref("products")
          .orderByChild("sort_num")
          .on("value", (snapshot) => {
            let array = [];
            snapshot.forEach(function (item) {
              array.push({
                uid: item.key,
                name: item.val().name,
                option: item.val().option,
                kal: item.val().kal,
                hot: item.val().hot,
                milk: item.val().milk,                
                category: item.val().category,
                image: item.val().image,
                price: parseInt(item.val().price),
                add: item.val().add,
                b_soldout: b_soldout,
                m_soldout: m_soldout,
                m_soldout2: m_soldout2,
                soldout: item.val().soldout,
                sort_num: item.val().sort_num ? item.val().sort_num : 9999,
                limit: item.val().limit,
                hidden: item.val().hidden ? item.val().hidden : false,
                jaego: item.val().jaego ? item.val().jaego : 
                       item.val().jaego === 0 ? 0 : "",
              });
            });
            let newFavorItem = [];
            array.map((el) => {
              let name = el.name;
              favorItem.forEach((favor) => {
                if (favor.name === name) {
                  newFavorItem.push({
                    ...favor,
                    ...el,
                  });
                }
              });
              return el;
            });
            //array = { ...array, ...newFavorItem };
            
            newFavorItem.map((el) => {
              let uid = el.uid;
              let favor = el.add_favor;
              array.forEach((el) => {
                if (el.uid === uid) {
                  el.add_favor = favor;
                }
                return el;
              });
            });

            array.sort((a, b) => {
              return a.sort_num - b.sort_num;
            });

            array = array.filter((el) => {
              if (CateRadio === "all") {
                return el;
              }
              return el.category === CateRadio;
            });
            array = array.filter((el) => {
              return el.hidden === false
            });
            setProdItem(array);
            setProdItemCopy(array);
          });          
        }
        getProdItem();
      }else{
        setSearchAgain(!SearchAgain);
      }
      return function cleanup() {
        mounted = false;
      };
    }, [CateRadio, SearchAgain]);
    
    
    useEffect(() => {
      if (ProdItemCopy && searchInput !== "") {
      let array = _.cloneDeep(ProdItemCopy);
      array.forEach(function (item) {
        var dis = Hangul.disassemble(item.name, true);
        var cho = dis.reduce(function (prev, elem) {
          elem = elem[0] ? elem[0] : elem;
          return prev + elem;
        }, "");
        item.diassembled = cho;
      });
      let arr = searchInput.concat();
      let search = Hangul.disassemble(arr).join("");
      array = array.filter(function (item) {
        return (
          item.diassembled.includes(searchInput) ||
          item.diassembled.includes(search) ||
          item.name.includes(searchInput)
          );
        });
        setProdItem(array);
    }    
  }, [searchInput])

  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);
  const [OnModal, setOnModal] = useState(false);
  const [OrderItem, setOrderItem] = useState();
  const orderHandler = (e, item) => {
    if (e.target.tagName !== "svg" && e.target.tagName !== "path") {
      /*
      if(!TodayLunchCheck){
        alert('식단체크를 먼저 해야 주문이 가능합니다.');
        return;
      }
      if(TodayLunchCheck && !TodayLunchCheck.confirm){
        alert('오늘의 식단을 확인 해야 주문이 가능합니다.');
        return;
      }
      */
      
      if (b_soldout === false) {
        item.add = "";
      }
      setOrderItem(item);
      setPosX(e.pageX);
      setPosY(e.pageY);
      setOnModal(true);
    }
  };
  const onFinished = () => {
    setOnModal(false);
  };

  const TopBox = (
    <>
      <Search
        style={{ marginBottom: "10px" }}
        allowClear
        enterButton="검색"
        size="large"
        placeholder="실시간 검색(초성가능)"
        value={searchInput}
        onSearch={onSearch}
        onChange={onSearchChange}
        type="text"
      />
      <div className="menuCategory">
        <Radio.Group
          className="menuCategory"
          onChange={itemSort}
          defaultValue="all"
          buttonStyle="solid"
        >
          <Radio.Button value="all">전체</Radio.Button>
          <Radio.Button value="커피">커피</Radio.Button>
          <Radio.Button value="라떼">라떼</Radio.Button>
          <Radio.Button value="에이드">에이드</Radio.Button>
          <Radio.Button value="차">차</Radio.Button>
          <Radio.Button value="프로틴">프로틴</Radio.Button>
          <Radio.Button value="스낵">스낵</Radio.Button>
          <Radio.Button value="주스">주스</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  const [LunchPop, setLunchPop] = useState(true)  
  const onConfrim =(uid) => {
    let date = curDate.full;
    try {
      firebase.database().ref(`lunch/user/${uid}/checkList/${date}`)
      .update({
        confirm: 1
      })
      setLunchPop(false)
    }catch (error) {
      console.error(error);
    }
  }


  const onLunchSubmit = (e) => {
    e.preventDefault();
    let list = [...lunchCheckBox.current.querySelectorAll('input[type=checkbox]:checked')];
    let arr = [];
    list.map(el=>{
      arr.push(el.dataset.value)
    })
    firebase.database().ref(`lunch/user/${userInfo.uid}/checkList/${curDate.full}`)
    .update({
      item: arr
    })
    setModifyState(false)
  }

  if (ProdItem.length) {
    return (
      <> 
        {userInfo && userInfo.auth && userInfo.auth.includes('guest') &&
            <Button onClick={guestPopOn} type="primary" className="btn-guest-home"><antIcon.AiOutlineHome style={{position:"relative",top:"2px",marginRight:"5px"}} />홈화면</Button>
        }
        {userInfo && userInfo.auth && userInfo.auth.includes('guest') && GuestHomePop &&
          <>
            <GuestHome prod={ProdItem} guestPopClose={guestPopClose} />
          </>
        }        
        {TodayLunchCheck && !TodayLunchCheck.confirm && curHourMin < 930 && LunchPop &&
          <div className="lunch-check-popup">
            {TodayLunchCheck.item && 
              <>
                <dl>
                  {!ModifyState &&
                    <>
                      <dt>{userInfo.displayName}님의 오늘식단</dt>
                      <dd className="item-list">
                        <span>
                        {TodayLunchCheck.item.map((el,idx)=>(
                          TodayLunchCheck.item.length == (idx+1) ? <span key={idx}>{el}</span> : <span key={idx}>{el},</span>
                        ))}  
                        </span>
                      </dd>
                    </>
                  }
                </dl>
                
                <div className="rest-time">
                  <antIcon.AiOutlineFieldTime />남은시간 : <Timer onTimeOut={onTimeOut} mm={restMin} ss={restSec}/>
                </div>                
                <div ref={lunchCheckBox} className={`check-list-box ${ModifyState && 'modify'}`}>
                  {ItemList && ModifyState && 
                  ItemList.map((list,l_idx) => (
                    <Checkbox key={l_idx} data-value={list} defaultChecked={TodayLunchCheck.item && TodayLunchCheck.item.includes(list) ? true : false}>{list}</Checkbox>
                  ))            
                  }
                </div>
                <div className="btn-box">
                  {!ModifyState &&
                    <>
                      <Button disabled={TimeOut} style={{marginRight:"5px"}} onClick={onModify}>수정하기</Button>
                      <Button disabled={TimeOut} type="primary" onClick={()=>{onConfrim(userInfo.uid)}}>식단확인</Button>
                    </>
                  }
                  {ModifyState &&
                    <Button type="primary" onClick={onLunchSubmit}>적용하기</Button>
                  }
                </div>
              </>
            }
            {!TodayLunchCheck.item && 
              <dl>
                <dt>오늘 식단을 아직 정하지 않았습니다.</dt>
                <div className="btn-box">
                  <Button type="primary"><Link to="/lunch">체크 하러가기</Link></Button>
                </div>
              </dl>
            }
          </div>
        }
        {TopBox}
        <ProdList>
          {ProdItem.map((item, index) => 
            (
            <div
              style={{ cursor: "pointer", position: "relative" }}
              className={`ani-fadein list delay-${index}`}
              key={index}
            >
              {(item.soldout === false || item.jaego === 0) && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    left: "0",
                    top: "0",
                    display: "flex",
                    fontSize: "14px",
                    color: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.5)",
                    zIndex: "10",
                  }}
                >
                  sold out
                </div>
              )}
              
              <div className="img" onClick={(e) => orderHandler(e, item)}>
                <span style={{ opacity: "0.85" }} className="kal">
                  {item.kal}kal
                </span>
                <img src={item.image} alt="" />
              </div>
              <div className="user-box" onClick={(e) => orderHandler(e, item)}>
                <div className="txt" style={{ padding: "0 5px" }}>
                  <div className="flex-box between">
                    <span className="name">
                      {item.name}
                      <span className="hidden">{item.uid}</span>
                      {(item.jaego > 0 && item.jaego < 6) && (
                      <div style={{fontSize:"12px",color:"red"}}>잔여수량 : {item.jaego}</div>
                      )}
                    </span>
                    <span
                      className={"ic-favor p-color " + item.add_favor}
                      onClick={(e) => {
                        onToggleFavor(e, item.name);
                      }}
                    >
                      <antIcon.AiFillStar className="favor" />
                      <antIcon.AiOutlineStar className="no-favor" />
                    </span>
                  </div>
                  <div className="flex-box between a-center">
                    <span className="hot">
                      {item.hot === "etc" ? "" : item.hot}
                    </span>
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "#888",
                      }}
                      className="price"
                    >
                      {commaNumber(item.price)}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
          )}
        </ProdList>
        {OnModal && (
          <OderModalPopup
            onFinished={onFinished}
            posx={PosX}
            posy={PosY}
            OrderItem={OrderItem}
          />
        )}
      </>
    );
  } else if (searchInput) {
    return (
      <>
        {TopBox}
        <div style={{ paddingTop: "15px" }}>
          <Empty
            description={
              <span>
                검색결과가 없습니다.
                <br />
                ※검색어가 제대로 입력된 경우엔 검색버튼을 다시 눌러보세요.
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </>
    );
  } else {
    return (
      <>
        {TopBox}
        <Loading />
      </>
    );
  }
}

export default Menu;
