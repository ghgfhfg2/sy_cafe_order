import React, { useEffect, useRef, useState } from 'react'
import { Button, Input, message, Switch } from 'antd';
import useInvenKakaoTel from '../../inven/useInvenKakaoTel';
import firebase, {wel} from "../../../firebase";

function InvenTelAdmin() {
  const db = firebase.database(wel);
  const inputTel = useRef();

  const { alertTelTxt } = useInvenKakaoTel();

  const [kakaoTel, setkakaoTel] = useState(false);  
  const kakaoTelToggle = () => {
    setkakaoTel(!kakaoTel)
  }

  const onSubmit = () => {
    let tel = inputTel.current.state.value;
    tel = tel.split(',');
    db.ref('inventory/alert_tel').set({
      ...tel
    })
    .then(()=>{
      message.success('업데이트 되었습니다.')
    })
  }
  return (
    <>
      <div className="flex-box a-center" style={{ marginBottom: "10px" }}>  
        <h3 className="title" style={{ margin: "0 10px 0 0" }}>
          알림톡 수신번호 등록
        </h3>
        <Switch
          onChange={kakaoTelToggle}
          checkedChildren="on"
          unCheckedChildren="off"
        />
      </div>
      {kakaoTel &&
        <>
          <Input.Group compact>
            <Input ref={inputTel} style={{ width: 'calc(100% - 75px)' }} defaultValue={alertTelTxt} />
            <Button type="primary" onClick={onSubmit}>Submit</Button>
          </Input.Group>
        </>
      }
    </>
  )
}

export default InvenTelAdmin