import React,{ useState, useEffect, useRef } from 'react';
import {Form, Button, Input, Radio, Checkbox, Row, Divider, Switch, message, Table, Upload, Modal, InputNumber, Popconfirm, DatePicker } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import * as antIcon from "react-icons/ai";
import ImgUpload from './ImgUpload';
import firebase, {wel} from "../../firebase";
import styled from "styled-components";
import uuid from "react-uuid";
import moment from 'moment';
import { useSelector } from "react-redux";
import { getFormatDate, getArr,getMax } from '../CommonFunc';
import { CSVLink } from "react-csv";
import { once } from 'lodash';
const { RangePicker } = DatePicker;

function InvenAdmin() {
  const nowDate = getFormatDate(new Date());
  const curDate = nowDate.full;
  const curMonth = curDate.substr(0,curDate.length-2)
  const db = firebase.database(wel);
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ProdItem, setProdItem] = useState();
  const formRef = useRef();

  const [Render, setRender] = useState(false)

  const [submitDate, setsubmitDate] = useState(nowDate);
  const onSubmitDate = (date, dateString) => {
    let res;
    res = date ? getFormatDate(new Date(date._d)) : getFormatDate(new Date());
    setsubmitDate(res);
  }
  const [DateStart, setDateStart] = useState(curDate);
  const [DateEnd, setDateEnd] = useState(curDate);
  const onSearchDate = (date, dateString) => {
    let start;
    let end;
    start = date ? getFormatDate(new Date(date[0]._d)).full : '';
    end = date ? getFormatDate(new Date(date[1]._d)).full : '';
    setDateStart(start);
    setDateEnd(end);
    setTimeout(()=>setRender(!Render),100)
    
  }  
  
  const [SearchMonth, setSearchMonth] = useState(curMonth);
  const onSearchMonth = (date, dateString) => {
    let regex = /-/g
    let month = dateString.replace(regex,"")
    setSearchMonth(month)
  } 

  const excelList = [    
    {label: "품명", key:"name"},
    {label: "재고", key:"ea"},
    {label: "장소", key:"place"},
    {label: "비고", key:"etc"}
  ]


  const excelHeaders = [
    {label: "등록일자", key:"date_"},
    {label: "입출고일자", key:"real_date_"},
    {label: "입출고", key:"type"},
    {label: "사용자", key:"name"},
    {label: "품명", key:"prod"},
    {label: "수량", key:"val"},
    {label: "출납 후 재고", key:"ea"}
  ]

  const excelHeaders2 = [    
    {label: "품명", key:"prod"},
    {label: "재고", key:"ea"}
  ]

  const excelHeaders3 = [    
    {label: "품명", key:"prod"},
    {label: "입고", key:"input"},
    {label: "출고", key:"output"}
  ]
  
  const [ModifyUid, setModifyUid] = useState("");
  const [ModifyData, setModifyData] = useState();

  const [Category, setCategory] = useState();  
  const [CateList, setCateList] = useState();
  const onCateInput = (e) => {
    setCategory(e.target.value)
  }
  const onCateInit = () => {
    db.ref("inventory")
    .update({
      category:Category
    })
    message.success('품목이 업데이트 되었습니다.')
  }
  useEffect(() => {
    db.ref("inventory/category")
    .on("value", snapshot => {
      let obj = {};
      if(snapshot.val()){
        obj = {
          txt:snapshot.val(),
          arr: snapshot.val().split(',')
        }
        setCateList(obj.arr)
        setCategory(obj.txt)
      }
    })

    db.ref("inventory/list")
    .on("value", snapshot => {
      let arr = [];
      snapshot.forEach(item=>{
        let obj = item.val();
        arr.push(obj)
      }) 
      arr.sort((a,b)=>{
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      })
      setProdItem(arr)
    })
    
    return () => {
      db.ref("inventory/list").off()
    }
  }, [Render])

  useEffect(() => {
    ModifyUid &&
    db.ref("inventory/list")
    .child(ModifyUid)
    .once("value")
    .then(item=>{
      setModifyData(item.val())
    })
    return () => {
      db.ref("inventory/list").off()
    }
  }, [ModifyUid])

  const [ThisLogUid, setThisLogUid] = useState();
  const [ThisLogData, setThisLogData] = useState();
  const onLogList = (uid,prod,ea) => {
    setIsLogVisible(true);
    let obj = {
      uid,prod,ea
    }
    setThisLogUid(obj)
  }
  useEffect(() => {
    ThisLogUid &&
    db.ref("inventory/log")
    .orderByKey()
    .startAt(DateStart)
    .endAt(DateEnd)
    .once("value")
    .then(snapshot=>{
      let arr = [];
      snapshot.val() && snapshot.forEach((el)=>{
        let obj = getArr(el.val())
        obj = obj.filter(list=> list.prod_uid === ThisLogUid.uid)
        let arr2 = [];
        obj.map(list=>{
          var obj2 = {
            ...list,
            date_: `${list.date.full_} ${list.date.hour}:${list.date.min}`,
            real_date_:`${list.real_date.full_}`,
            name:`${list.name}(${list.part})`
          }
          arr2.push(obj2)
        }) 
        arr.push(...arr2)
      })
      setThisLogData(arr)
    })
    return () => {
      
    }
  }, [ThisLogUid])

  // 일변 재고조회
  const [EaDate, setEaDate] = useState(curDate);
  const SearchEaDate = (date, dateString) => {
    let regex = /-/g;
    let day = dateString.replace(regex,"")
    setEaDate(day)
  } 
  const [EaData, setEaData] = useState()
  useEffect(() => {
    let arr = [];
    db.ref("inventory/log_date")
    .once('value', snapshot => {
      snapshot.forEach(el=>{        
        let obj = el.val();
        let keys = Object.keys(obj);
        if(keys.includes(EaDate)){
          arr.push(obj[EaDate])
        }else{
          let idx = getMax(keys,EaDate)
          if(idx){
            arr.push(obj[idx])
          }
        }
      })
      setEaData(arr)
    })

    return () => {
    }
  }, [EaDate])
  const date_columns = [
    {
      title: '품명',
      dataIndex: 'prod',
      key: 'prod',
      align: 'center',  
      width: 100,    
      render: data => data
    },
    {
      title: '재고',
      dataIndex: 'ea',
      key: 'ea',
      align: 'center',  
      width: 100,    
      render: data => data ? data : 0
    } 
  ]


  // 전체조회(월별)
  const [TotalLogData, setTotalLogData] = useState()
  useEffect(() => {
    let arr = [];
    db.ref("inventory/log_month")
    .orderByKey()
    .equalTo(SearchMonth)
    .on("value", snapshot => {
      snapshot.val() && snapshot.forEach((el)=>{
        let obj = getArr(el.val())
        arr.push(...obj)
      })
      setTotalLogData(arr)
    })
    return () => {
      db.ref("inventory/log_month").off();
    }
  }, [SearchMonth,Render])
  const total_columns = [
    {
      title: '년월',
      dataIndex: 'prod',
      key: 'prod',
      align: 'center',  
      width: 100,    
      render: data => `${SearchMonth.substr(0,SearchMonth.length-2)}-${SearchMonth.substr(4,SearchMonth.length-2)}`
    },
    {
      title: '품명',
      dataIndex: 'prod',
      key: 'prod',
      align: 'center',  
      width: 100,    
      render: data => data
    },
    {
      title: '입고',
      dataIndex: 'input',
      key: 'input',
      align: 'center',  
      width: 100,    
      render: data => data ? data : 0
    },
    {
      title: '출고',
      dataIndex: 'output',
      key: 'output',
      align: 'center',  
      width: 100,    
      render: data => data ? data : 0
    }  
  ]
  
  const [LogListData, setLogListData] = useState()
  useEffect(() => {
    db.ref(`inventory/log`)
    .orderByKey()
    .startAt(DateStart)
    .endAt(DateEnd)
    .on("value", snapshot => {
      let arr = [];
      snapshot.val() && snapshot.forEach((el)=>{
        let obj = getArr(el.val())
        let arr2 = [];
        obj.map(list=>{
          let obj2 = {
            ...list,
            date_: `${list.date.full_} ${list.date.hour}:${list.date.min}`,
            real_date_:`${list.real_date.full_}`,
            name:`${list.name}(${list.part})`
          }
          arr2.push(obj2)
        })
        arr.push(...arr2)
        setLogListData(arr)
      })
    })
    return () => {
      db.ref("inventory/list").off()
    }
  }, [Render])
  

  const onPlus = (uid,prod,ea) => {
    let val = document.querySelector(`#plus_${uid}`).value;
    if(!val){
      message.error('입고할 개수를 입력해 주세요.');
      return
    }
    let rest = parseInt(ea) + parseInt(val)
    val &&
    db.ref(`inventory/log/${submitDate.full}/${uuid()}`)
    .update({
      prod,
      prod_uid:uid,
      ea:rest,
      type:'입고',
      name:userInfo.displayName,
      part:userInfo.photoURL,
      sosok:userInfo.sosok,
      uid:userInfo.uid,
      val,
      real_date:submitDate,
      comment:LogMessege,
      date:getFormatDate(new Date())
    })
    val && 
    db.ref(`inventory/list/${uid}/ea`)
    .transaction(pre=>{
      return pre + parseInt(val);
    })

    let monthDate = submitDate.full.substr(0,submitDate.full.length-2)
    val && 
    db
    .ref(`inventory/log_month/${monthDate}/${uid}`)
    .update({
      prod
    })
    db
    .ref(`inventory/log_month/${monthDate}/${uid}/input`)
    .transaction(pre=>{
      if(pre == 'undefined'){
        db.ref(`inventory/log_month/${monthDate}/${uid}/input`)
        .update(parseInt(val))
      }else{
        return pre + parseInt(val);
      }      
    })

    db
    .ref(`inventory/log_date/${uid}/${submitDate.full}`)
    .update({
      prod,
      ea:rest
    });

    message.success('업데이트 완료');
    setLogMessege('')
    setRender(!Render)
  }
  const onMinus = (uid,prod,ea) => {    
    let val = document.querySelector(`#minus_${uid}`).value;
    if(!val){
      message.error('출고할 개수를 입력해 주세요.');
      return
    }
    if(ea < val){
      message.error('남은 재고개수보다 많습니다.');
      return;
    }
    let rest = parseInt(ea) - parseInt(val);
    val &&    
    db.ref(`inventory/log/${submitDate.full}/${uuid()}`)
    .update({
      ea:rest,
      prod,
      prod_uid:uid,
      type:'출고',
      name:userInfo.displayName,
      part:userInfo.photoURL,
      sosok:userInfo.sosok,
      uid:userInfo.uid,
      real_date:submitDate,
      comment:LogMessege,
      val,
      date:getFormatDate(new Date())
    });

    let monthDate = submitDate.full.substr(0,submitDate.full.length-2)
    db
    .ref(`inventory/log_month/${monthDate}/${uid}`)
    .update({
      prod
    })
    db
    .ref(`inventory/log_month/${monthDate}/${uid}/output`)
    .transaction(pre=>{
      if(pre == 'undefined'){
        db.ref(`inventory/log_month/${monthDate}/${uid}/output`)
        .update(parseInt(val))
      }else{
        return pre + parseInt(val);
      }
    })    
    db.ref(`inventory/list/${uid}/ea`)
    .transaction(pre=>{
      return pre - parseInt(val);
    })

    db
    .ref(`inventory/log_date/${uid}/${submitDate.full}`)
    .update({
      prod,
      ea:rest
    });
    message.success('업데이트 완료');
    setLogMessege('')
    setRender(!Render)
  }

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
      title: '품명',
      dataIndex: 'name',
      key: 'name',
      align: 'center',  
      width: 200,    
      sorter: {
        compare: (a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
        defaultSortOrder: 'ascend',
      },
      render: data => data
    },
    {
      title: '품목',
      dataIndex: 'category',
      key: 'category',
      align: 'center',  
      width: 100,          
      render: data => data
    },
    {
      title: '재고',
      dataIndex: 'ea',
      key: 'ea',
      align: 'center',      
      render: (text,row) => <>
        <span>{row['ea']}</span>
      </>
    },
    {
      title: '장소',
      dataIndex: 'place',
      key: 'place',
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
      dataIndex: ['uid','name','ea'],
      key: 'uid',
      align: 'center',      
      render: (text,row) => <>
        <div style={{marginBottom:"5px"}}>
          <InputNumber id={`plus_${row['uid']}`} min={1} max={999} style={{width:"50px"}} />
          <Button style={{marginRight:"5px",marginLeft:"-1px"}} onClick={()=>onPlus(row['uid'],row['name'],row['ea'])}>입고</Button>
          <InputNumber id={`minus_${row['uid']}`} min={1} max={999} style={{width:"50px"}} />
          <Button style={{marginRight:"5px",marginLeft:"-1px"}} onClick={()=>onMinus(row['uid'],row['name'],row['ea'])}>출고</Button>
        </div>
        <Button onClick={()=>onModify(row['uid'])}>내용수정</Button>
        <Button style={{marginLeft:"5px"}} onClick={()=>onLogList(row['uid'],row['name'],row['ea'])}>내역</Button>
        <Popconfirm
          title={`${row['name']}을(를) 삭제하시겠습니까?`}
          onConfirm={()=>onDelete(row['uid'])}
          onCancel={cancel}
          okText="네"
          cancelText="아니오"
        >
          <Button style={{marginLeft:"5px"}}>삭제</Button>
        </Popconfirm>
      </>
    }
  ]

  const cancel = (e) => {
    message.error('취소되었습니다.');
  }

  const columns2 = [
    {
      title: '등록일자',
      dataIndex: ['date','date_'],
      key: 'date',
      align: 'center',  
      width: 100,    
      sorter: {
        compare: (a, b) => b.date.timestamp - a.date.timestamp,
        multiple: 1,
      },
      defaultSortOrder: 'ascend',
      render: (text,row) => `${row['date'].full_} ${row['date'].hour}:${row['date'].min}`
    },
    {
      title: '입출고일자',
      dataIndex: ['real_date','real_date_'],
      key: 'real_date',
      align: 'center',  
      width: 100,    
      sorter: {
        compare: (a, b) => b.real_date.timestamp - a.real_date.timestamp,
        multiple: 2,
      },
      defaultSortOrder: 'ascend',
      render: (text,row) => `${row['real_date_']}`
    },
    {
      title: '입출고',
      dataIndex: 'type',
      key: 'type',
      align: 'center',  
      width: 100,    
      render: data => data
    },
    {
      title: '사용자',
      dataIndex: ['name','part'],
      key: 'name',
      align: 'center',  
      width: 100,    
      render: (text,row) => `${row['name']}`
    },
    {
      title: '품명',
      dataIndex: 'prod',
      key: 'prod',
      align: 'center',  
      width: 120,    
      render: data => data
    },
    {
      title: '수량',
      dataIndex: 'val',
      key: 'val',
      align: 'center',  
      width: 40,    
      render: data => data
    },  
    {
      title: '비고',
      dataIndex: 'comment',
      key: 'comment',
      align: 'center',  
      width: 200,    
      render: data => data
    }, 
    {
      title: '출납 후 재고',
      dataIndex: 'ea',
      key: 'ea',
      align: 'center',  
      width: 80,    
      render: (text,row) => <>
        <span>{row['ea']}</span>
      </>
    },
  ]

  const columns3 = [
    {
      title: '등록일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center',  
      width: 100,    
      sorter: {
        compare: (a, b) => a.date.timestamp - b.date.timestamp,
        multiple: 2,
      },
      render: data => `${data.full_} ${data.hour}:${data.min}`
    },
    {
      title: '입출고일자',
      dataIndex: 'real_date',
      key: 'real_date',
      align: 'center',  
      width: 100,    
      sorter: {
        compare: (a, b) => a.real_date.timestamp - b.real_date.timestamp,
        multiple: 1,
      },
      render: data => data.full_
    },
    {
      title: '입출고',
      dataIndex: 'type',
      key: 'type',
      align: 'center',  
      width: 100,    
      render: data => data
    },
    {
      title: '사용자',
      dataIndex: ['name','part'],
      key: 'name',
      align: 'center',  
      width: 120,    
      render: (text,row) => `${row['name']}`
    },
    {
      title: '수량',
      dataIndex: 'val',
      key: 'val',
      align: 'center',  
      width: 50,    
      render: data => data
    },  
    {
      title: '비고',
      dataIndex: 'comment',
      key: 'comment',
      align: 'center',  
      width: 200,    
      render: data => data
    }, 
    {
      title: '출납 후 재고',
      dataIndex: 'ea',
      key: 'ea',
      align: 'center',  
      width: 80,    
      render: (text,row) => <>
        <span>{row['ea']}</span>
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
    let upload = '';
    if(values.upload){
      upload = values.upload[0]
    }
    let regex = /[^0-9]/g;
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
      }else{
        delete values.upload
      }
        db
        .ref(`inventory/list`)
        .child(uid)
        .set({
          ...values,
          ea:parseInt(values.ea),
          uid,
          date: getFormatDate(new Date()),
          image: downloadURL ? downloadURL : '',
        });
        db
        .ref(`inventory/log/${submitDate.full}/${uuid()}`)
        .update({
          type:'입고',
          prod:values.name,
          prod_uid:uid,
          name:userInfo.displayName,
          part:userInfo.photoURL,
          sosok:userInfo.sosok,
          uid:userInfo.uid,
          val:parseInt(values.ea),
          ea:parseInt(values.ea),
          real_date:submitDate,
          date:getFormatDate(new Date())          
        });

        let monthDate = submitDate.full.substr(0,submitDate.full.length-2)
        db
        .ref(`inventory/log_month/${monthDate}/${uid}`)
        .update({
          prod:values.name,
          prod_uid:uid,
          input:parseInt(values.ea),
          output:0                 
        });
        
        db
        .ref(`inventory/log_date/${uid}/${submitDate.full}`)
        .update({
          prod:values.name,
          ea:parseInt(values.ea)           
        });

        message.success("상품을 등록했습니다.");
        formRef.current.resetFields();
    } catch (error) {
      alert(error);
    }
  }
  const [isModalVisible, setIsModalVisible] = useState(false);  
  const [isLogVisible, setIsLogVisible] = useState(false);  

  const onCountCheck = (e) => {
    let str = e.target.value;
    let regex = /[^0-9]/g;
    if(str.match(regex)){
      message.error('숫자만 입력해 주세요');
    }
  }
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsLogVisible(false);
    setModifyUid('');
    setThisLogUid('');
    setThisLogData('');
    setModifyData('');
  };  
  const onModify = (uid) => {
    setModifyUid(uid)
    setIsModalVisible(true);
  }  
  const onDelete = (uid) => {
    const storageRef = firebase.storage().ref(`inventory/prod_image/${uid}`);

    const onResolve = (url) => {
      db.ref('inventory/list')
      .child(uid)
      .remove();
      message.success('삭제에 성공했습니다.');
      storageRef.delete()
    }
    const onReject = (error) => {
      db.ref('inventory/list')
      .child(uid)
      .remove();
      message.success('삭제에 성공했습니다.');
    }

    storageRef.getDownloadURL()
    .then(onResolve,onReject);

  }


  const onModifySubmit = (values) => {
    const uid = ModifyData.uid;
    db
    .ref("inventory/list")
    .child(uid)
    .update({
      ...values
    });
    message.success("업데이트에 성공했습니다.");
    setIsModalVisible(false);
    setModifyData('');
  }

  const [LogMessege, setLogMessege] = useState('')
  const onMessege = (e) => {
    setLogMessege(e.target.value)
  }

  

  return (
    <>
      <div className="flex-box a-center" style={{ marginBottom: "10px" }}>
        <h3 className="title" style={{ margin: "0 10px 0 0",flexShrink:"0" }}>
          품목등록
        </h3>
        <Input onChange={onCateInput} value={Category} />      
        <Button type="primary" style={{marginLeft:"5px"}} onClick={onCateInit}>등록</Button>
      </div>
      <div className="flex-box a-center" style={{ marginBottom: "10px" }}>
        <h3 className="title" style={{ margin: "0 10px 0 0" }}>
          비품등록
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
            <Input className="sm-input" />
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
            name="place"
            label="장소"
            rules={[
              {
                required: true,
                message: "재고개수를 입력해 주세요",
              }
            ]}
          >
            <Input className="sm-input" />
          </Form.Item>
          <Form.Item 
            label="품목" 
            name="category"
            rules={[
              {
                required: true,
                message: "품목을 입력해 주세요",
              }
            ]}
          >
            <Radio.Group>
              {
                CateList && CateList.map(el=>(
                  <>
                    <Radio.Button value={el}>{el}</Radio.Button>
                  </>
                ))
              }
            </Radio.Group>
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
      <div style={{marginBottom:"20px"}}>
        <RangePicker defaultValue={[moment(DateStart,'YYYY-MM-DD'),moment(DateEnd,'YYYY-MM-DD')]} onChange={onSearchDate} style={{marginRight:"5px"}} />
        <span style={{fontSize:"12px",color:"#888"}}>*날짜 검색</span>
      </div>
      <div className="flex-box a-center" style={{marginBottom:"10px"}}>
        <h3 className="title" style={{marginBottom:"0",marginRight:"10px"}}>비품 리스트</h3>
        {ProdItem &&
        <Button style={{marginRight:"5px"}}>
          <CSVLink 
            headers={excelList} 
            data={ProdItem} 
            filename={`metree-expendables-list-${EaDate}.csv`} 
            target="_blank"
          >
            <antIcon.AiOutlineFileExcel style={{position:"relative",top:"3px",fontSize:"17px",marginRight:"3px"}} />엑셀 다운로드
          </CSVLink>
        </Button>
        }
        <DatePicker defaultValue={moment(DateStart,'YYYY-MM-DD')} onChange={onSubmitDate} style={{marginRight:"5px"}} />
        <span style={{fontSize:"12px",color:"#888"}}>*실 입출고시간이 있는경우 선택</span>
      </div>
      <div className="flex-box a-center" style={{marginBottom:"10px"}}>
        <span style={{flexShrink:"0",marginRight:"5px"}}>입출고시 추가 메세지</span>
        <Input onChange={onMessege} value={LogMessege} />   
      </div>
      {ProdItem &&
        <Table 
          columns={columns} 
          dataSource={ProdItem}
        />      
      }
      <Modal title="수정" 
       visible={isModalVisible}
       onCancel={handleCancel}
       centered
       footer={false}
      >
        {ModifyData &&
          <Form 
            className="admin-prod-form" 
            onFinish={onModifySubmit}
            initialValues={{
              'name': ModifyData.name,
              'category': ModifyData.category,
              'ea': ModifyData.ea,
              'etc': ModifyData.etc
            }}
          >
                  {ModifyData.category}
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
            label="품목" 
            name="category"
            rules={[
              {
                required: true,
                message: "품목을 입력해 주세요",
              }
            ]}
          >
            <Radio.Group>
              {
                CateList && CateList.map(el=>(
                  <>
                    <Radio.Button value={el}>{el}</Radio.Button>
                  </>
                ))
              }
            </Radio.Group>
          </Form.Item>      
          <Form.Item
            name="etc"
            label="비고"
          >
            <Input />
          </Form.Item>
          <div
            className="btn-box"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Button
              htmlType="submit"
              type="primary"
              size="large"
            >
              수정하기
            </Button>
          </div>
        </Form>
        }
      </Modal>
      {ThisLogUid &&
        <Modal title={`${ThisLogUid.prod} 입출고 내역`} 
        visible={isLogVisible}
        onCancel={handleCancel}
        centered
        width={1000}
        footer={false}
        >
          {ThisLogData && ThisLogData.length > 0 &&
            <>
              <Button style={{marginBottom:"10px"}}>
                <CSVLink 
                  headers={excelHeaders} 
                  data={ThisLogData} 
                  filename={`metree-expendables-${DateStart}_${DateEnd}.csv`} 
                  target="_blank"
                >
                  <antIcon.AiOutlineFileExcel style={{position:"relative",top:"3px",fontSize:"17px",marginRight:"3px"}} />엑셀 다운로드
                </CSVLink>
              </Button>
              <Table 
                columns={columns3} 
                dataSource={ThisLogData}
              />  
            </>
          }
        </Modal>
      }
      <div className="flex-box a-center" style={{marginTop:"30px",marginBottom:"10px"}}>
        <h3 className="title" style={{marginBottom:"0",marginRight:"10px"}}>비품 입출고 내역</h3>
        {LogListData &&
        <Button>
          <CSVLink 
            headers={excelHeaders} 
            data={LogListData} 
            filename={`metree-expendables-${DateStart}_${DateEnd}.csv`} 
            target="_blank"
          >
            <antIcon.AiOutlineFileExcel style={{position:"relative",top:"3px",fontSize:"17px",marginRight:"3px"}} />엑셀 다운로드
          </CSVLink>
        </Button>
        }
      </div>
      {ProdItem &&
        <Table 
          columns={columns2} 
          dataSource={LogListData}
        />      
      }

      <div className="flex-box a-center" style={{marginTop:"30px",marginBottom:"10px"}}>
        <h3 className="title" style={{marginBottom:"0",marginRight:"10px"}}>월간 입출고내역</h3>
        {TotalLogData &&
        <Button style={{marginRight:"5px"}}>
          <CSVLink 
            headers={excelHeaders3} 
            data={TotalLogData} 
            filename={`metree-expendables-date-${EaDate}.csv`} 
            target="_blank"
          >
            <antIcon.AiOutlineFileExcel style={{position:"relative",top:"3px",fontSize:"17px",marginRight:"3px"}} />엑셀 다운로드
          </CSVLink>
        </Button>
        }
        <DatePicker defaultValue={moment(SearchMonth,'YYYY-MM')} onChange={onSearchMonth} picker="month" style={{marginRight:"5px"}} />
        <span style={{fontSize:"12px",color:"#888"}}>*월별 검색</span>
      </div>
      {TotalLogData &&
        <Table 
          columns={total_columns} 
          dataSource={TotalLogData}
        />      
      }

      <div className="flex-box a-center" style={{marginTop:"30px",marginBottom:"10px"}}>
        <h3 className="title" style={{marginBottom:"0",marginRight:"10px"}}>일별 재고</h3>
        {EaData &&
        <Button style={{marginRight:"5px"}}>
          <CSVLink 
            headers={excelHeaders2} 
            data={EaData} 
            filename={`metree-expendables-date-${EaDate}.csv`} 
            target="_blank"
          >
            <antIcon.AiOutlineFileExcel style={{position:"relative",top:"3px",fontSize:"17px",marginRight:"3px"}} />엑셀 다운로드
          </CSVLink>
        </Button>
        }
        <DatePicker defaultValue={moment(EaDate,'YYYY-MM-DD')} onChange={SearchEaDate} picker="date" style={{marginRight:"5px"}} />
        <span style={{fontSize:"12px",color:"#888"}}>*일별 검색</span>
      </div>
      {EaDate &&
        <Table 
          columns={date_columns} 
          dataSource={EaData}
        />      
      }
    </>
  )
}

export default InvenAdmin

