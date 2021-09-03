import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import * as antIcon from "react-icons/ai";
import { commaNumber,getFormatDate } from "./CommonFunc";
import { useSelector } from "react-redux";
import Loading from "./Loading";

const curDate = getFormatDate(new Date());
function MyMenu() {
  const userInfo = useSelector((state) => state.user.currentUser);

  const [FavorItem, setFavorItem] = useState([]);
  const [ProdItem, setProdItem] = useState([]);
  const [AddFavorItem, setAddFavorItem] = useState([]);
  const [SortItem, setSortItem] = useState(false);

  const onToggleFavor = (e, name) => {
    e.currentTarget.closest(".list").remove();
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

  useEffect(() => {
    let mounted = true;
    if (mounted) {
  

      async function getProdItem() {
        let favor = [];
        let favorName = [];
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
          .ref(`users/${userInfo.uid}/favorite`)
          .orderByChild("count")
          .startAt(1)
          .once("value")
          .then((snapshot) => {
            snapshot.forEach(function (item) {
              favorName.push(item.key);
              favor.push({
                name: item.key,
                count: item.val().count,
              });
            });
          });
        setFavorItem(favor);
        await firebase
          .database()
          .ref("products")
          .once("value")
          .then((snapshot) => {
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
                jaego: item.val().jaego ? item.val().jaego : 
                       item.val().jaego === 0 ? 0 : "",
              });
            });
            setProdItem(array);
          });
        setSortItem(true);
        if (FavorItem && ProdItem) {
          let array = ProdItem.concat();
          array = array.filter((el) => {
            return favorName.includes(el.name);
          });
          let assignArr = [];
          array.map(el => {
            favor.map((item) => {
              item.name === el.name && assignArr.push(Object.assign(item, el));
            });
          });
          assignArr.sort((a, b) => {
            if (a.count > b.count) {
              return -1;
            }
            if (a.count < b.count) {
              return 1;
            }
            return 0;
          });
          assignArr = assignArr.slice(0, 10);
          setProdItem(assignArr);
        }

      }
      getProdItem();
      //즐찾
      async function getFavorItem() {
        let addFavor = [];
        let addFavorName = [];
        let array = [];
        await firebase
          .database()
          .ref(`users/${userInfo.uid}/favorite`)
          .orderByChild("add_favor")
          .equalTo(true)
          .once("value")
          .then((snapshot) => {
            snapshot.forEach(function (item) {
              addFavorName.push(item.key);
              addFavor.push({
                name: item.key,
                add_favor: item.val().add_favor,
              });
            });
          });
        await firebase
          .database()
          .ref("products")
          .once("value")
          .then((snapshot) => {
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
              });
            });
          });
          
        array = array.filter((el) => {
          return addFavorName.includes(el.name);
        });
        array.map((el) => {
          addFavor.map((favor) => {
            favor.name === el.name && Object.assign(favor, el);
          });
          return addFavor;
        });
        array.sort((a, b) => {
          return a.sort_num - b.sort_num;
        });
        setAddFavorItem(array);
      }
      getFavorItem();
    }
    return function cleanup() {
      mounted = false;
    };
  }, [SortItem]);

  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);
  const [OnModal, setOnModal] = useState(false);
  const [OrderItem, setOrderItem] = useState();
  const orderHandler = (e, item) => {
    /*
    if(TodayLunchCheck && !TodayLunchCheck.confirm){
      alert('식단체크를 먼저 해야 주문이 가능합니다.');
      return;
    }
    */
    if (e.target.tagName !== "svg" && e.target.tagName !== "path") {
      if (b_soldout === false) {
        item.add = "";
      }
      setOrderItem(item);
      setPosX(e.clientX);
      setPosY(e.clientY);
      setOnModal(true);
    }
  };
  
  const onFinished = () => {
    setOnModal(false);
  };

  return (
    <>
      <h3 className="title">즐겨찾기 메뉴</h3>
      {AddFavorItem ? (
        <ProdList>
          {AddFavorItem.map((item, index) => (
            <div
              style={{ cursor: "pointer",position:"relative" }}
              className={`ani-fadein list delay-${index}`}
              key={index}              
            >
              {item.soldout === false && (
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
                      <div style={{fontSize:"12px",color:"red"}}>품절임박 - 잔여수량 : {item.jaego}</div>
                      )}
                    </span>
                    <span
                      className="ic-favor true p-color"
                      onClick={(e) => {
                        onToggleFavor(e, item.name);
                      }}
                    >
                      <antIcon.AiFillStar className="favor" />
                    </span>
                  </div>
                  <div className="flex-box between a-center">
                    <span className="hot">{item.hot}</span>
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
          ))}
        </ProdList>
      ) : (
        <>
          <Loading />
        </>
      )}
      <h3 className="title" style={{ marginTop: "30px" }}>
        내가 많이 주문한 메뉴 TOP 10
      </h3>
      {SortItem ? (
        <ProdList>
          {ProdItem.map((item, index) => (
            <div
              style={{ cursor: "pointer",position:"relative" }}
              className={`ani-fadein list delay-${index}`}
              key={index}              
            >
              {item.soldout === false && (
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
                    zIndex: "100",
                  }}
                >
                  sold out
                </div>
              )}
              <div className="img" onClick={(e) => orderHandler(e, item)}>
                <span style={{ opacity: "0.85" }} className="kal">
                  {item.kal}kal
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "0",
                    zIndex: "10",
                    padding:"0 7px",
                    height: "26px",
                    background: "#333",
                    textAlign: "center",
                    lineHeight: "26px",
                    fontSize: "12px",
                    borderBottomRightRadius: "6px",
                    color: "#fff",
                  }}
                >
                  {index + 1}위  
                  <span style={{fontSize:"11px"}}> ({item.count}회 주문)</span>
                </span>
                <img src={item.image} alt="" />
              </div>
              <div className="user-box" onClick={(e) => orderHandler(e, item)}>
                <div className="txt" style={{ padding: "0 5px" }}>
                  <span className="name">
                    {item.name}
                    <span className="hidden">{item.uid}</span>
                    {(item.jaego > 0 && item.jaego < 6) && (
                    <div style={{fontSize:"12px",color:"red"}}>품절임박 - 잔여수량 : {item.jaego}</div>
                    )}
                  </span>
                  <div className="flex-box between a-center">
                    <span className="hot">{item.hot}</span>
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
          ))}
        </ProdList>
      ) : (
        <>
          <Loading />
        </>
      )}
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
}

export default MyMenu;
