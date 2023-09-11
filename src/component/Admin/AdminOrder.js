import React, { useState, useEffect } from "react";
import { Button, message, Radio } from "antd";
import styled from "styled-components";
import firebase from "../../firebase";
import { commaNumber, notify, getFormatDate } from "../CommonFunc";
import { Howl } from "howler";
import { BsPhone } from "react-icons/bs";
import axios from "axios";
import src1 from "../../jumun.mp3";
import src2 from "../../jumun2.mp3";
import src3 from "../../jumun3.mp3";
import src4 from "../../jumun4.mp3";
import src5 from "../../pling.mp3";
import src6 from "../../dding.mp3";
import src7 from "../../alert.mp3";

export const OrderBox = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  .list {
    &.user {
      position: relative;
      padding-left: 80px;
      .order-prod-img {
        width: 55px;
        height: 55px;
        border-radius: 50%;
        overflow: hidden;
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        &.no-img {
          border: 1px solid #ededed;
        }
        img {
          height: 100%;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
      }
      .btn-cancel {
        margin-right: 5px;
      }
    }
    .ic-hot,
    .ic-ice {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      opacity: 0.4;
      margin-right: 10px;
      position: relative;
      top: 1px;
    }
    .ic-hot {
      background: #f02424;
    }
    .ic-ice {
      background: #1890ff;
    }
    color: #888;
    &.state_0 {
      .ic-hot,
      .ic-ice {
        opacity: 0.85;
      }
      color: #555;
      border-color: #e6f7ff;
      .info {
        color: #111;
        font-weight: 500;
      }
    }
    &.state_1 {
      .ic-hot,
      .ic-ice {
        opacity: 1;
      }
      .info {
        color: #111;
        font-weight: 500;
      }
    }
    .from {
      border-bottom: 1px solid #ddd;
      height: 30px;
    }
    .shrink-0 {
      flex-shrink: 0;
    }
    diplay: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: calc(50% - 10px);
    margin: 5px;
    .from {
      margin-bottom: 5px;
    }
    .date {
      font-size: 12px;
    }
    .info-box {
      display: flex;
      min-height: 30px;
      align-items: center;
      .info {
        margin-right: 7px;
      }
      .ant-btn {
        height: 28px;
        padding: 0 7px;
        line-height: 1;
        span {
          height: 100%;
          line-height: 28px;
          font-size: 12px;
        }
      }
    }
    & > div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 4px;
    }
  }
  @media all and (max-width: 1200px) {
    .list {
      width: 100%;
      margin: 5px 0;
      &.user {
        padding-left: 76px;
        .order-prod-img {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          overflow: hidden;
          position: absolute;
          left: 13px;
        }
        .btn-cancel {
          height: 28px;
          font-size: 12px;
          padding: 0 10px;
        }
      }
    }
  }
`;

function AdminOrder() {
  const [SoundSelect, setSoundSelect] = useState();
  useEffect(() => {
    firebase
      .database()
      .ref("order_sound")
      .child("sound")
      .once("value")
      .then((snapshot) => {
        setSoundSelect(snapshot.val());
      });
  }, []);
  const onSoundChange = (e) => {
    setSoundSelect(e.target.value);
    SoundSelect && Sound.play();
    firebase.database().ref("order_sound").update({ sound: e.target.value });
  };

  const Sound = new Howl({
    src: [SoundSelect],
  });

  const [OrderList, setOrderList] = useState([]);
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
        .database()
        .ref("order")
        .orderByChild("order_state")
        .endAt(1)
        .on("value", (snapshot) => {
          let array = [];
          snapshot.forEach(function (item) {
            // if(item.val().category !== '셀프'){
            //   array.push({
            //     ...item.val(),
            //     key: item.key,
            //   });
            // }
            array.push({
              ...item.val(),
              key: item.key,
            });
          });
          // eslint-disable-next-line array-callback-return
          array.sort((a, b) => {
            if (a.timestamp > b.timestamp) {
              return 1;
            }
            if (a.timestamp < b.timestamp) {
              return -1;
            }
          });
          setOrderList(array);
        });
    }
    return function cleanup() {
      firebase.database().ref("order").off();
      mounted = false;
    };
  }, []);

  const [OrderCount, setOrderCount] = useState();
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
        .database()
        .ref("order_count")
        .on("value", (snapshot) => {
          setOrderCount(snapshot.val());
          if (OrderList.length > 0) {
            SoundSelect && Sound.play();
            notify("새 주문이 들어왔습니다.");
          }
        });
    }

    return function cleanup() {
      firebase.database().ref("order_count").off();
      mounted = false;
    };
  }, [OrderCount]);

  const stateChange = (key) => {
    firebase
      .database()
      .ref(`order/${key}`)
      .child("order_state")
      .transaction((pre) => {
        return pre + 1;
      });
  };
  const stateChange2 = (key) => {
    firebase
      .database()
      .ref(`order/${key}`)
      .child("order_state")
      .transaction((pre) => {
        return pre + 1;
      });
  };

  const kakaoSend = (key) => {
    let time = getFormatDate(new Date(key.order_time.split("|")[0]));
    time = time.full + time.hour + time.min + time.sec;
    let url =
      "https://metree.co.kr/_sys/_xml/order_kakao.php?order_tel=" +
      key.order_phone +
      "&goods_name=" +
      key.prod_name +
      "&order_time=" +
      time;

    //window.open(url,'kakao',"height=1,width=1");

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        message.success("카톡알림이 발송되었습니다.");
        return response;
      })
      .catch((err) => {
        console.log(err);
      });

    return;
  };

  const orderCancel = (key, uid) => {
    if (window.confirm("주문 취소 하시겠습니까?")) {
      firebase.database().ref("order").child(key).remove();
      firebase
        .database()
        .ref("products")
        .child(uid)
        .transaction((pre) => {
          if (pre.jaego >= 0) {
            pre.jaego++;
            return pre;
          }
        });
      message.success("주문이 취소되었습니다.");
    }
  };

  return (
    <>
      <h3 className="title">주문관리</h3>
      <div style={{ marginBottom: "15px" }}>
        <Radio.Group onChange={onSoundChange} value={SoundSelect}>
          <Radio.Button value="">무음</Radio.Button>
          <Radio.Button value={src1}>주문-여자</Radio.Button>
          <Radio.Button value={src2}>주문-남자</Radio.Button>
          <Radio.Button value={src3}>주문-여자아이</Radio.Button>
          <Radio.Button value={src4}>주문-남자아이</Radio.Button>
          <Radio.Button value={src5}>효과음1</Radio.Button>
          <Radio.Button value={src6}>효과음2</Radio.Button>
          <Radio.Button value={src7}>효과음3</Radio.Button>
        </Radio.Group>
      </div>
      <OrderBox className="order-list-box">
        {OrderList.map((list, index) => (
          <div
            className={`list state_${list.order_state} ${
              list.category === "셀프" ? "self" : ""
            }`}
            key={index}
          >
            <span style={{ display: "none" }}>{list.key}</span>
            <div className="from">
              <span className="flex-box a-center">
                {list.order_name}
                <span
                  style={{
                    marginLeft: "5px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "500",
                  }}
                >
                  <BsPhone style={{ marginRight: "3px" }} />
                  {list.order_phone &&
                    list.order_phone.substr(list.order_phone.length - 4, 4)}
                </span>
              </span>
              <span style={{ flexShrink: "0" }}>{list.order_part}</span>
            </div>
            <div className="prod">
              <div className="info-box">
                <span className="info">
                  {list.category === "셀프" && <>(셀프)</>}
                  {list.prod_name}
                  {list.prod_option ? `-${list.prod_option}` : ""}
                </span>
                {list.hot === "hot" ? (
                  <span className="ic-hot shrink-0"></span>
                ) : list.hot === "ice" ? (
                  <span className="ic-ice shrink-0"></span>
                ) : (
                  ""
                )}
                {/* <span className="info shrink-0">{list.amount}개</span> */}
                {list.add && <span className="info shrink-0">{list.add}</span>}
                {list.add2 && list.add2[0] && (
                  <span className="info shrink-0">{list.add2[0]}</span>
                )}
                {list.add2 && list.add2[1] && (
                  <span className="info shrink-0">{list.add2[1]}</span>
                )}
                {list.milk && (
                  <span className="info shrink-0">{list.milk}</span>
                )}
              </div>
              <span className="shrink-0">
                {commaNumber(parseInt(list.price))}원
              </span>
            </div>
            <div style={{ color: "red", fontWeight: "500" }}>
              {list.order_etc && list.order_etc}
            </div>
            <div className="state">
              <span className="date">{list.order_time}</span>
              <div>
                {list.order_state === 0 && (
                  <>
                    <Button
                      style={{ marginRight: "5px" }}
                      onClick={() => {
                        orderCancel(list.key, list.prod_uid);
                      }}
                    >
                      주문취소
                    </Button>
                    <Button
                      onClick={() => {
                        stateChange(list.key);
                      }}
                    >
                      주문접수
                    </Button>
                  </>
                )}
                {list.order_state === 1 && (
                  <Button
                    onClick={() => {
                      stateChange2(list.key);
                      kakaoSend(list);
                    }}
                  >
                    완료처리
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </OrderBox>
    </>
  );
}

export default AdminOrder;
