import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { message, Button, Input, TimePicker } from "antd";
import { getFormatDate } from "../CommonFunc";
import moment from "moment";
const { TextArea } = Input;

function StylerAdmin() {
  const welDb = firebase.database();

  const [DefaultNotice, setDefaultNotice] = useState();
  const [DefaultTimeSet, setDefaultTimeSet] = useState();
  useEffect(() => {
    welDb.ref("styler/time_set").once("value", (data) => {
      setDefaultTimeSet(data.val());
    });

    welDb.ref("styler/notice").once("value", (data) => {
      setDefaultNotice(data.val());
    });
    return () => {};
  }, []);

  const [Notice, setNotice] = useState();
  const onNotice = (e) => {
    setNotice(e.target.value);
  };
  const onNoticeSubmit = () => {
    welDb
      .ref("styler")
      .update({
        notice: Notice,
      })
      .then(() => message.success("적용되었습니다."));
  };

  const [TimeInterval, setTimeInterval] = useState();
  const onTimeInterval = (e) => {
    setTimeInterval(e.target.value);
  };

  const [TimeRange, setTimeRange] = useState();
  const [DateRange, setDateRange] = useState();
  const onTimeRange = (e) => {
    if (e) {
      let time = {
        start: [new Date(e[0]._d).getHours(), new Date(e[0]._d).getMinutes()],
        end: [new Date(e[1]._d).getHours(), new Date(e[1]._d).getMinutes()],
      };
      let date = {
        start: getFormatDate(new Date(e[0]._d)),
        end: getFormatDate(new Date(e[1]._d)),
      };
      setTimeRange(time);
      setDateRange(date);
    } else {
      setTimeRange("");
    }
  };

  const onTimeSubmit = () => {
    if (!TimeInterval && !DefaultTimeSet) {
      message.error("시간간격을 입력해 주세요");
      return;
    }
    if (!TimeRange && !DefaultTimeSet) {
      message.error("시작시작과 끝나는시간을 입력해 주세요");
      return;
    }
    welDb
      .ref("styler/time_set")
      .update({
        interval: TimeInterval
          ? parseInt(TimeInterval)
          : DefaultTimeSet.interval,
        start: TimeRange ? TimeRange.start : DefaultTimeSet.start,
        end: TimeRange ? TimeRange.end : DefaultTimeSet.end,
        date_start: DateRange ? DateRange.start : DefaultTimeSet.date_start,
        date_end: DateRange ? DateRange.end : DefaultTimeSet.date_end,
      })
      .then(() => message.success("적용되었습니다."));
  };

  return (
    <>
      <h3 className="title">공지사항</h3>
      <div className="flex-box">
        {DefaultNotice && (
          <TextArea
            style={{ height: "60px" }}
            onChange={onNotice}
            defaultValue={DefaultNotice}
          />
        )}
        {!DefaultNotice && (
          <TextArea style={{ height: "60px" }} onChange={onNotice} />
        )}
        <Button
          onClick={onNoticeSubmit}
          type="primary"
          style={{ marginLeft: "5px", height: "60px" }}
        >
          적용
        </Button>
      </div>
      <h3 className="title" style={{ marginTop: "20px" }}>
        시간 설정
      </h3>
      {DefaultTimeSet && (
        <Input
          type="number"
          style={{ width: "50px" }}
          onChange={onTimeInterval}
          defaultValue={DefaultTimeSet.interval}
        />
      )}
      {!DefaultTimeSet && (
        <Input
          type="number"
          style={{ width: "50px" }}
          onChange={onTimeInterval}
        />
      )}
      분 간격
      {DefaultTimeSet && (
        <TimePicker.RangePicker
          style={{ marginLeft: "5px" }}
          format="HH:mm"
          onChange={onTimeRange}
          defaultValue={[
            moment(
              DefaultTimeSet.date_start.hour +
                ":" +
                DefaultTimeSet.date_start.min,
              "HH:mm"
            ),
            moment(
              DefaultTimeSet.date_end.hour + ":" + DefaultTimeSet.date_end.min,
              "HH:mm"
            ),
          ]}
        />
      )}
      {!DefaultTimeSet && (
        <TimePicker.RangePicker
          style={{ marginLeft: "5px" }}
          format="HH:mm"
          onChange={onTimeRange}
        />
      )}
      <Button
        onClick={onTimeSubmit}
        type="primary"
        style={{ marginLeft: "5px" }}
      >
        적용
      </Button>
      <p style={{ marginTop: "5px", fontSize: "12px" }}>
        * 시간설정이 변경되면 현재 예약중인 시간이 변경 될 수 있습니다.
      </p>
    </>
  );
}

export default StylerAdmin;
