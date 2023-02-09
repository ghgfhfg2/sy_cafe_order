import { Button } from "antd";
import React, { useState, useEffect } from "react";
import firebase, { old } from "../firebase";
import { Popover, message } from "antd";
import { commaNumber, notify, getFormatDate } from "./CommonFunc";
import { useSelector } from "react-redux";
import { OrderBox } from "./Admin/AdminOrder";
import * as antIcon from "react-icons/ai";
import Loading from "./Loading";
import { Empty, DatePicker } from "antd";
const { RangePicker } = DatePicker;

function MyOrder() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [OrderList, setOrderList] = useState([]);
  const [Nodata, setNodata] = useState(false);

  const [StartDate, setStartDate] = useState(20210101);
  const [EndDate, setEndDate] = useState(21210101);

  const [ReRender, setReRender] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
        .database()
        .ref("order")
        .orderByChild("order_uid")
        .equalTo(userInfo.uid)
        .on("value", (snapshot) => {
          let array = [];
          snapshot.forEach(function (item) {
            let date = item.val().order_time.split("-");
            date = parseInt(date[0] + "" + date[1] + date[2].split(" ")[0]);
            let date2 = item.val().order_time.split(" ");
            date2 = new Date(date2[0] + "T" + date2[1].split("|")[0]).getTime();
            array.push({
              ...item.val(),
              key: item.key,
              order_date: date,
              timestamp: date2,
            });
          });
          // eslint-disable-next-line array-callback-return
          array.sort((a, b) => {
            if (a.timestamp < b.timestamp) {
              return 1;
            }
            if (a.timestamp > b.timestamp) {
              return -1;
            }
          });
          array = array.filter((el) => {
            return StartDate <= el.order_date && el.order_date <= EndDate;
          });
          array = array.slice(0, 30);
          setOrderList(array);
          if (array.length === 0) {
            setNodata(true);
          }
          notify("주문상태가 변경되었습니다.");
        });
    }
    return function cleanup() {
      firebase.database().ref("order").off();
      mounted = false;
    };
  }, [ReRender]);

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

  const stateChange = (key) => {
    firebase
      .database()
      .ref(`order/${key}`)
      .child("order_state")
      .transaction((pre) => {
        return pre + 2;
      });
  };

  const onDateChange = (e) => {
    if (e) {
      setStartDate(getFormatDate(e[0]._d).full);
      setEndDate(getFormatDate(e[1]._d).full);
      setReRender(!ReRender);
    }
  };

  const dbDel = () => {
    firebase
      .database()
      .ref("order")
      .once("value", (data) => {
        data.forEach((el) => {
          if (el.val().timestamp < new Date().getTime() - 2592000000) {
            firebase.database().ref(`order/${el.key}`).remove();
          }
        });
      });
  };

  if (OrderList.length) {
    return (
      <>
        {userInfo && userInfo.role > 2 && (
          <Button onClick={dbDel}>old delete</Button>
        )}
        <div className="flex-box a-center">
          <RangePicker onChange={onDateChange} />
          <span style={{ color: "#999", fontSize: "12px", marginLeft: "5px" }}>
            *최근 한달안의 데이터만 검색 가능합니다.
          </span>
        </div>
        <OrderBox className="order-list-box">
          {OrderList.map((list, index) => (
            <div className={`user list state_${list.order_state}`} key={index}>
              {list.prod_img ? (
                <div className="order-prod-img">
                  <img src={list.prod_img} />
                </div>
              ) : (
                <div className="order-prod-img no-img">
                  <antIcon.AiOutlineCoffee />
                </div>
              )}
              <div className="prod">
                <div className="info-box">
                  <span className="info">
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
                  <div>
                    {list.add && (
                      <span className="info shrink-0">{list.add}</span>
                    )}
                    {list.add2 && (
                      <span className="info shrink-0">{list.add2}</span>
                    )}
                    {list.milk && (
                      <span className="info shrink-0">{list.milk}</span>
                    )}
                  </div>
                  {list.order_etc && (
                    <Popover content={list.order_etc} trigger="click">
                      <Button type="default">기타</Button>
                    </Popover>
                  )}
                </div>
                <span className="shrink-0">
                  {commaNumber(parseInt(list.price))}원
                </span>
              </div>
              <div className="state">
                <span className="date">
                  {list.order_time.split("|")[0]}&nbsp; (
                  {list.order_time.split("|")[1]})
                </span>
                <span className="setting">
                  {list.order_state === 0 && (
                    <>
                      <Button
                        className="btn-cancel"
                        style={{ marginRight: "5px" }}
                        onClick={() => {
                          orderCancel(list.key, list.prod_uid);
                        }}
                      >
                        주문취소
                      </Button>
                      {list.category === "셀프" && (
                        <Button
                          className="btn-cancel"
                          style={{ marginRight: "5px" }}
                          onClick={() => {
                            stateChange(list.key);
                          }}
                        >
                          픽업완료
                        </Button>
                      )}
                    </>
                  )}
                  {list.order_state === 0 && "대기중"}
                  {list.order_state === 1 && "주문접수"}
                  {list.order_state === 2 && "완료"}
                </span>
              </div>
            </div>
          ))}
        </OrderBox>
      </>
    );
  } else if (Nodata) {
    return (
      <>
        {userInfo && userInfo.role > 2 && (
          <Button onClick={dbDel}>old delete</Button>
        )}
        <Empty
          description="주문내역이 없습니다."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        ></Empty>
      </>
    );
  } else {
    return (
      <>
        <Loading />
      </>
    );
  }
}

export default MyOrder;
