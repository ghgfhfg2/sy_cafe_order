import React, { useEffect, useState } from "react";
import firebase from "../../firebase";
import { useSelector } from "react-redux";
import {
  Popover,
  Popconfirm,
  message,
  Button,
  DatePicker,
  Statistic,
} from "antd";
import * as antIcon from "react-icons/ai";
import * as imIcon from "react-icons/im";
import * as riIcon from "react-icons/ri";
import { getFormatDate } from "../CommonFunc";
import moment from "moment";
import { constant } from "lodash";
import axios from "axios";
const { Countdown } = Statistic;

function Styler() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const welDb = firebase.database();
  const [CurDate, setCurDate] = useState(getFormatDate(new Date()));
  const [TimeData, setTimeData] = useState();

  const timeTable = (time, styler, start1, start2, end1, end2) => {
    const first = new Date(
      SearchDate.year,
      SearchDate.og_month,
      SearchDate.og_day,
      start1,
      start2
    );
    const last = new Date(
      SearchDate.year,
      SearchDate.og_month,
      SearchDate.og_day,
      end1,
      end2
    );
    let timeArr = [];
    let copy = timeArr.concat();
    let n = 0;
    let stylerArr = [];
    for (let i = 1; i <= styler; i++) {
      stylerArr.push({
        room_num: i,
      });
    }
    while (first.getTime() < last.getTime()) {
      let obj = {
        timeNum: n + 1,
        time: getFormatDate(first),
        room: stylerArr,
      };
      first.setMinutes(first.getMinutes() + time);
      timeArr.push(obj);
      n++;
    }
    return timeArr;
  };

  const [Rerender, setRerender] = useState(false);
  const onRerender = () => {
    setRerender(!Rerender);
  };
  const [ListData, setListData] = useState();

  const getListOff = () => {
    welDb.ref(`styler/list/${CurDate.full}`).off();
  };

  const [DefaultNotice, setDefaultNotice] = useState();
  useEffect(() => {
    welDb.ref("styler/notice").once("value", (data) => {
      setDefaultNotice(data.val());
    });
    return () => {};
  }, []);

  useEffect(() => {
    setInterval(() => {
      setCurDate(getFormatDate(new Date()));
    }, 2000);
    return () => {};
  }, []);

  const [SearchDate, setSearchDate] = useState(CurDate);

  const [MyReservation, setMyReservation] = useState();
  useEffect(() => {
    //시간설정
    welDb.ref("styler/time_set").once("value", (data) => {
      const startTime = data.val() ? data.val().start : "";
      const endTime = data.val() ? data.val().end : "";
      const interval = data.val() ? data.val().interval : "";
      // 사용자 목록
      welDb.ref(`styler/user/${userInfo.uid}/list`).on("value", (data) => {
        let userArr = [];
        data.forEach((el) => {
          for (let i in el.val()) {
            if (el.val()[i].reserve_time > Date.now()) {
              console.log(el.val()[i]);
              let room = el.val()[i].room_num <= 3 ? 1 : 2;
              let obj = {
                date: getFormatDate(new Date(el.val()[i].reserve_time)),
                timestamp: el.val()[i].timestamp,
                timeNum: el.val()[i].timeNum,
                roomNum: el.val()[i].room,
                room: room,
              };
              userArr.push(obj);
            }
          }
        });
        setMyReservation(userArr);
      });

      // 예약목록
      let arr = [];
      welDb.ref(`styler/list/${SearchDate.full}`).on("value", (data) => {
        let timeArr = timeTable(
          interval,
          6,
          startTime[0],
          startTime[1],
          endTime[0],
          endTime[1]
        ); //시간표 생성
        let arr2 = JSON.parse(JSON.stringify(timeArr));
        data.forEach((el) => {
          arr.push(el.val());
        });
        timeArr.map((time, idx) => {
          arr.map((user) => {
            if (user.timeNum === time.timeNum) {
              for (let key in user) {
                if (key != "timeNum" && user[key]) {
                  arr2[idx][key] = user[key];
                  arr2[idx].room[user[key].room - 1] = {
                    ...arr2[idx].room[user[key].room - 1],
                    num: "room" + user[key].room,
                    check: true,
                  };
                }
              }
            }
          });
          arr2[idx].reservCount = Object.keys(arr2[idx]).length - 3;
        });
        setListData(arr2);
      });
    });

    return () => {
      welDb.ref(`styler/list/${SearchDate.full}`).off();
    };
  }, [Rerender]);

  const reservation = (num, time, styler) => {
    let room = "room" + styler;
    const user = {
      name: userInfo.displayName,
      part: userInfo.photoURL,
      user_uid: userInfo.uid,
      room: styler,
    };

    welDb
      .ref(`styler/user/${userInfo.uid}/list/${SearchDate.full}`)
      .get()
      .then((data) => {
        if (data.exists()) {
          message.error("예약은 하루에 한건만 가능합니다.");
        } else {
          welDb
            .ref(`styler/list/${SearchDate.full}/${num}`)
            .get()
            .then((data) => {
              let able = true;
              for (let i = 1; i < styler; i++) {
                let num = "room" + i;
                console.log(data.val());
                if (!data.val() || (data.val() && !data.val()[num])) {
                  message.error("예약은 순서대로 해주세요.");
                  able = false;
                  return;
                }
              }
              if (able) {
                // 예약 목록
                welDb.ref(`styler/list/${SearchDate.full}/${num}`).update({
                  [room]: user,
                  timeNum: num,
                });

                // 사용자 예약목록
                welDb
                  .ref(
                    `styler/user/${userInfo.uid}/list/${SearchDate.full}/${num}`
                  )
                  .update({
                    reserve_time: time.timestamp,
                    timestamp: new Date().getTime(),
                    timeNum: num,
                    room,
                    room_num: styler,
                  });

                // 카운팅
                welDb
                  .ref(`styler/user/${userInfo.uid}/count`)
                  .transaction((pre) => {
                    pre++;
                    return pre;
                  });
                welDb.ref(`styler/count`).transaction((pre) => {
                  pre++;
                  return pre;
                });
                message.success("예약 되었습니다.");
              }
            });
        }
      });
  };

  const onCancel = (date, num, room) => {
    const dateTime = date.full + String(date.hour) + String(date.min);
    welDb
      .ref(`styler/list/${date.full}/${num}/${room}`)
      .remove()
      .then(() => {});
    welDb.ref(`styler/user/${userInfo.uid}/list/${date.full}/${num}`).remove();
    welDb.ref(`styler/user/${userInfo.uid}/count`).transaction((pre) => {
      pre--;
      return pre;
    });
    welDb.ref(`styler/count`).transaction((pre) => {
      pre--;
      return pre;
    });

    message.success("취소 되었습니다.");

    setRerender(!Rerender);
  };

  // 날짜선택
  const onSelectDate = (date, dateString) => {
    if (date) {
      setSearchDate(getFormatDate(date._d));
      setRerender(!Rerender);
    }
  };
  const disabledDate = (current) => {
    return current && current >= moment().endOf("day");
  };

  return (
    <>
      {DefaultNotice && (
        <div className="item-info-box" style={{ marginBottom: "20px" }}>
          <pre>{DefaultNotice}</pre>
        </div>
      )}
      <div className="flex-box a-center" style={{ marginBottom: "20px" }}>
        <h3 className="title" style={{ marginRight: "10px" }}>
          날짜선택
        </h3>
        <DatePicker
          format="YYYY-MM-DD"
          defaultValue={moment()}
          disabledDate={disabledDate}
          style={{ marginBottom: "10px" }}
          onChange={onSelectDate}
        />
      </div>
      {MyReservation && MyReservation.length > 0 && (
        <>
          <h3 className="title">예정중인 내 예약목록</h3>
          <ul className="my-reserv-list styler">
            {MyReservation.map((el, idx) => (
              <li key={idx}>
                <div className="box">
                  <div className="r-day">
                    <span className="room">{el.room}</span>
                    <span className="date fon-barlow">
                      {el.date.full === CurDate.full
                        ? "오늘 "
                        : `${el.date.full_} `}
                      {el.date.hour}:{el.date.min}
                    </span>
                  </div>
                  <div className="right">
                    <div className="count-box">
                      <antIcon.AiOutlineHourglass className="ic-time" />
                      <Countdown
                        className="countdown"
                        value={el.date.timestamp}
                        format="H시간 m분 s초"
                        onFinish={onRerender}
                      />
                    </div>
                    <Popconfirm
                      title="예약 취소 하시겠습니까?"
                      onConfirm={() => {
                        onCancel(el.date, el.timeNum, el.roomNum);
                      }}
                    >
                      <Button className="btn-del">
                        <antIcon.AiOutlineRollback />
                        <span className="no-mo">예약취소</span>
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {ListData && (
        <>
          <h3 className="title" style={{ marginTop: "25px" }}>
            예약하기
          </h3>
          <ul className="flex-box reserv-info">
            <li>
              <antIcon.AiOutlineBell className="info-ic-reserv" /> 예약중
            </li>
            <li>
              <antIcon.AiOutlineBell className="info-ic-my" /> 내예약
            </li>
          </ul>
          <ul className="reserv-time-list styler">
            {ListData.map((el, idx) => (
              <li
                key={idx}
                className={
                  el.time.timestamp > CurDate.timestamp &&
                  el.user &&
                  el.user.user_uid === userInfo.uid
                    ? "my-reserve"
                    : el.time.timestamp > CurDate.timestamp && el.user
                    ? "reserv"
                    : el.time.timestamp < CurDate.timestamp
                    ? "timeover"
                    : ""
                }
              >
                <div className={el.reservCount === 6 ? "box full" : "box"}>
                  <span className="time fon-barlow">
                    {el.time.hour}:{el.time.min}
                  </span>
                  <div className="btn-box">
                    {el.room.map((list) => (
                      <>
                        <Popconfirm
                          title={
                            list.room_num <= 3
                              ? `1번기기에 예약하시겠습니까?`
                              : `2번기기에 예약하시겠습니까?`
                          }
                          disabled={
                            el.time.timestamp < CurDate.timestamp || list.check
                              ? true
                              : false
                          }
                          onConfirm={() => {
                            reservation(el.timeNum, el.time, list.room_num);
                          }}
                        >
                          <Button
                            className={
                              el[list.num] &&
                              el[list.num].user_uid === userInfo.uid
                                ? "my-reserv"
                                : list.check
                                ? "btn-reserv"
                                : ""
                            }
                          >
                            {list.check ? (
                              <Popover
                                content={`${el[list.num].name}(${
                                  el[list.num].part
                                })`}
                                trigger="click"
                                title="예약"
                              >
                                <antIcon.AiOutlineBell
                                  style={{ fontSize: "16px" }}
                                />
                              </Popover>
                            ) : (
                              <>
                                {list.room_num === 1 ? (
                                  <>
                                    <riIcon.RiNumber1 />
                                  </>
                                ) : list.room_num === 2 ? (
                                  <>
                                    <riIcon.RiNumber1 />
                                  </>
                                ) : list.room_num === 3 ? (
                                  <>
                                    <riIcon.RiNumber1 />
                                  </>
                                ) : list.room_num === 4 ? (
                                  <>
                                    <riIcon.RiNumber2 />
                                  </>
                                ) : list.room_num === 5 ? (
                                  <>
                                    <riIcon.RiNumber2 />
                                  </>
                                ) : list.room_num === 6 ? (
                                  <>
                                    <riIcon.RiNumber2 />
                                  </>
                                ) : (
                                  ""
                                )}
                              </>
                            )}
                          </Button>
                        </Popconfirm>
                      </>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export default Styler;
