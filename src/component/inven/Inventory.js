import React,{ useState, useEffect, useRef } from 'react';
import firebase, {wel} from "../../firebase";
import { getFormatDate } from '../CommonFunc';
import { Button,Popconfirm,message,InputNumber,Modal,Form,Input,DatePicker } from 'antd'
import * as bsIcon from "react-icons/bs";
import { useSelector } from "react-redux";
import uuid from "react-uuid";

function Inventory() {
  const nowDate = getFormatDate(new Date());
  const curDate = nowDate.full;
  const db = firebase.database(wel);
  const userInfo = useSelector((state) => state.user.currentUser);
  const [InvenData, setInvenData] = useState();
  const formRef = useRef();
  useEffect(() => {    
    db.ref('inventory/list')
    .on('value',snapshot => {
      let arr = [];
      snapshot.forEach(el => {
        arr.push(el.val())
      })
      setInvenData(arr)
    })
    return () => {
      db.ref('inventory/list').off()
    }
  }, [])

  const cancel = function cancel(e) {
    message.error('취소되었습니다.');
  }
  const handleCancel = () => {
    setIsModalVisible(false);
    setModifyUid('');
  }; 
  const onModify = (uid,name,ea) => {
    let obj = {
      uid,
      name,
      ea
    }
    setModifyUid(obj)
    setIsModalVisible(true);
  }
  const [ModifyUid, setModifyUid] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);  
  const onModifySubmit = (values) => {
    let ea = parseInt(ModifyUid.ea) - parseInt(values.val);
    if(ea < 0){
      message.error('재고가 부족합니다.');
      return
    }
    let date = values.real_date ? getFormatDate(new Date(values.real_date)) : getFormatDate(new Date());
    values.real_date = date;
    values.comment = values.comment ? values.comment : '';
    let obj = {
      ...values,
      ea,
      type:"출고",
      prod_uid:ModifyUid.uid,
      prod:ModifyUid.name,
      name:userInfo.displayName,
      part:userInfo.photoURL,
      sosok:userInfo.sosok,
      uid:userInfo.uid,
      date:getFormatDate(new Date()),
    }

    db.ref(`inventory/log/${curDate}/${uuid()}`)
    .update({...obj})

    db.ref(`inventory/list/${ModifyUid.uid}`)
    .child('ea')
    .transaction((pre) => {
      let curValue = pre;
      curValue = parseInt(pre) - parseInt(values.val);
      return curValue;
    });

    let monthDate = curDate.substr(0,curDate.length-2)
    db
    .ref(`inventory/log_month/${monthDate}/${ModifyUid.uid}`)
    .update({
      prod:ModifyUid.name
    })
    db
    .ref(`inventory/log_month/${monthDate}/${ModifyUid.uid}/output`)
    .transaction(pre=>{
      if(pre == 'undefined'){
        db.ref(`inventory/log_month/${monthDate}/${ModifyUid.uid}/output`)
        .update(parseInt(values.val))
      }else{
        return pre + parseInt(values.val);
      }
    }) 

    db
    .ref(`inventory/log_date/${ModifyUid.uid}/${curDate}`)
    .update({
      prod:ModifyUid.name,
      ea          
    });

    message.success("출고완료");
    formRef.current.resetFields();
    setIsModalVisible(false);
    setModifyUid("");

  }
  return (
    <>
      {InvenData && 
      <ul className="inven-list-box">
        {InvenData.map((el,idx)=>(
          <li key={idx}>
            <div className="list-con">
              <div className="left">
                {el.image ? <div className="img-box"><img src={el.image} /></div>
                  : <div className="img-box no-img"><bsIcon.BsImage /></div>
                }
                <dl className="txt-box">
                  <dt>{el.name}</dt>
                  <dd>{el.etc}</dd>
                </dl>
              </div>
              <div className="right">
                <span className="ea">재고 : {el.ea}</span>
                  <div className="input-box">
                    <Button type="primary" onClick={()=>onModify(el.uid,el.name,el.ea)}>사용</Button>
                  </div>
              </div>
            </div>
          </li>
        ))}
      </ul>      
      }
      {ModifyUid && 
      <Modal title={`${ModifyUid.name}`} 
       visible={isModalVisible}
       onCancel={handleCancel}
       centered
       footer={false}
      >
        <Form 
          className="admin-prod-form" 
          onFinish={onModifySubmit}
          ref={formRef}
        >   
          <Form.Item
            name="real_date"
            label="실출고일"
          >  
            <DatePicker style={{marginRight:"5px"}} />       
          </Form.Item>
          <Form.Item
            name="val"
            label="수량"            
            rules={[
              {
                required: true,
                message: "재고개수를 입력해 주세요",
              },
            ]}
          >
            <InputNumber min={1} max={999} style={{width:"50px"}} />
          </Form.Item>
          <Form.Item
            name="comment"
            label="비고"
          >
            <Input style={{maxWidth:"100%"}} />
          </Form.Item>
          <div
            className="btn-box"
            style={{ width: "100%", maxWidth: "100%", textAlign: "center" }}
          >
            <Button
              htmlType="submit"
              type="primary"
              size="large"
            >
              출고하기
            </Button>
          </div>
        </Form>
      </Modal>
      }
    </>
  )
}

export default Inventory
