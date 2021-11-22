import React,{ useState, useEffect, useRef } from 'react';
import {Form, Button, Input, Radio, Checkbox, Row, Divider, Switch, message, Table, Upload, Modal } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import ImgUpload from './ImgUpload';
import firebase from "../../firebase";
import styled from "styled-components";
import uuid from "react-uuid";
import { getFormatDate } from '../CommonFunc';

function InvenAdmin() {
  const db = firebase.database()
  const [ProdItem, setProdItem] = useState();
  const formRef = useRef();
  
  const [ModifyUid, setModifyUid] = useState("");
  const [ModifyData, setModifyData] = useState()
  useEffect(() => {
    db.ref("inventory")
    .on("value", snapshot => {
      var arr = [];
      snapshot.forEach(item=>{
        arr.push(item.val())
      })
      setProdItem(arr)
    })
    
    return () => {
      
    }
  }, [])

  useEffect(() => {
    ModifyUid &&
    db.ref("inventory")
    .child(ModifyUid)
    .once("value")
    .then(item=>{
      setModifyData(item.val())
      console.log(ModifyData)
    })
    return () => {
      
    }
  }, [ModifyUid])

  const columns = [
    {
      title: '사진',
      dataIndex: 'image',
      key: 'image',
      align: 'center',
      width: 150,      
      render: data => data ? <img style={{maxHeight:"50px"}} src={data} /> : ''
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      align: 'center',  
      width: 200,    
      render: data => data
    },
    {
      title: '재고',
      dataIndex: 'ea',
      key: 'ea',
      align: 'center',      
      render: data => data
    },
    {
      title: '비고',
      dataIndex: 'etc',
      key: 'etc',
      align: 'center',      
      render: data => data
    },
    {
      title: '관리',
      dataIndex: 'uid',
      key: 'uid',
      align: 'center',      
      render: (text,row) => <>
        <Button onClick={()=>onModify(row['uid'])}>수정</Button>
        <Button style={{marginLeft:"5px"}} onClick={()=>onDelete(row['uid'])}>삭제</Button>
      </>
    },
  ]

  const [ProdRegist, setProdRegist] = useState(false);
  const ProdRegistToggle = () => {
    setProdRegist(!ProdRegist);
  };  


  const normFile = (e) => {
  
    if (Array.isArray(e)) {
      return e;
    }
  
    return e && e.fileList;
  };


  const onSubmitProd = async (values) => {
    values.etc = values.etc ? values.etc : '';
    values.upload = values.upload ? values.upload : ''
    var upload = '';
    if(values.upload){
      upload = values.upload[0]
    }
    var regex = /[^0-9]/g;
    if(values.ea.match(regex)){
      message.error('재고는 숫자만 입력해 주세요');
      return
    }
    try {
      let downloadURL;
      const uid = uuid();
      if(upload != ''){
        const file = upload.originFileObj;
        const metadata = upload.type;
        let uploadTaskSnapshot = await firebase
        .storage()
        .ref("inventory")
        .child(`prod_image/${uid}`)
        .put(file, metadata);
        downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();
      }
      await firebase
        .database()
        .ref("inventory")
        .child(uid)
        .set({
          ...values,
          uid,
          date: getFormatDate(new Date()),
          image: downloadURL ? downloadURL : '',
        });
        message.success("상품을 등록했습니다.");
        formRef.current.resetFields();
    } catch (error) {
      alert(error);
    }
  }
  const [isModalVisible, setIsModalVisible] = useState(false);  

  const onCountCheck = (e) => {
    var str = e.target.value;
    var regex = /[^0-9]/g;
    if(str.match(regex)){
      message.error('숫자만 입력해 주세요');
    }
  }
  const handleCancel = () => {
    setIsModalVisible(false);
  };  
  const onModify = (uid) => {
    setModifyUid(uid)
    setIsModalVisible(true);
  }
  const onDelete = (uid) => {
    firebase.storage().ref(`inventory/prod_image/${uid}`)
    .delete()
    .then(res => {
      db.ref('inventory')
      .child(uid)
      .remove();
      message.success('삭제에 성공했습니다.')
    })  
    .catch(error=>{
      message.error(error)
    })



  }


  const onModifySubmit = (values) => {
    console.log(values,ModifyData)
    const uid = ModifyData.uid;
    firebase
        .database()
        .ref("inventory")
        .child(uid)
        .update({
          ...values
        });
        message.success("업데이트에 성공했습니다.");
        setIsModalVisible(false);
  }
  return (
    <>
      <div className="flex-box a-center" style={{ marginBottom: "10px" }}>
        <h3 className="title" style={{ margin: "0 10px 0 0" }}>
          상품등록
        </h3>
        <Switch
          onChange={ProdRegistToggle}
          checkedChildren="on"
          unCheckedChildren="off"
        />
      </div>            
      {ProdRegist && (
        <Form ref={formRef} className="admin-prod-form" onFinish={onSubmitProd}>     
          <Form.Item 
            name="upload"
            label="Upload"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload 
               listType="picture"
            >
              <Button icon={<UploadOutlined />}>이미지 업로드</Button>
            </Upload>
          </Form.Item>     
          <Form.Item
            name="name"
            label="상품명"            
            rules={[
              {
                required: true,
                message: "상품명을 입력해 주세요",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ea"
            label="재고개수"            
            onChange={onCountCheck}
            rules={[
              {
                required: true,
                message: "재고개수를 입력해 주세요",
              },
            ]}
          >
            <Input className="sm-input" />
          </Form.Item>
          <Form.Item
            name="etc"
            label="비고"
          >
            <Input />
          </Form.Item>
          <div
            style={{ width: "100%", maxWidth: "250px", textAlign: "center" }}
          >
            <Button
              htmlType="submit"
              style={{ width: "100%" }}
              type="primary"
              size="large"
            >
              등록하기
            </Button>
          </div>
        </Form>
      )}
      <Divider />     
      
      <h3 className="title">상품리스트</h3>
      <Table 
        columns={columns} 
        dataSource={ProdItem}
      />      
      <Modal title="Basic Modal" 
       visible={isModalVisible}
       onCancel={handleCancel}
       footer={false}
      >
        {ModifyData &&
          <Form 
            className="admin-prod-form" 
            onFinish={onModifySubmit}
            initialValues={{
              'name': ModifyData.name,
              'ea': ModifyData.ea,
              'etc': ModifyData.etc
            }}
          >
                  
          <Form.Item
            name="name"
            label="상품명"  
            rules={[
              {
                required: true,
                message: "상품명을 입력해 주세요",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ea"
            label="재고개수"
            rules={[
              {
                required: true,
                message: "재고개수를 입력해 주세요",
              },
            ]}
          >
            <Input className="sm-input" />
          </Form.Item>
          <Form.Item
            name="etc"
            label="비고"
          >
            <Input />
          </Form.Item>
          <div
            style={{ width: "100%", maxWidth: "250px", textAlign: "center" }}
          >
            <Button
              htmlType="submit"
              style={{ width: "100%" }}
              type="primary"
              size="large"
            >
              수정하기
            </Button>
          </div>
        </Form>
        }
      </Modal>
    </>
  )
}

export default InvenAdmin

