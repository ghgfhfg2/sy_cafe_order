import React,{ useState, useEffect, useRef } from 'react';
import firebase, {wel} from "../../firebase";
import { getFormatDate } from '../CommonFunc';
import { Button,Radio,Popconfirm,message,InputNumber,Modal,Form,Input,DatePicker,Table } from 'antd'
import * as bsIcon from "react-icons/bs";
import * as antIcon from "react-icons/ai";
import * as goIcon from "react-icons/go";
import { useSelector } from "react-redux";
import uuid from "react-uuid";
import moment from 'moment';
const { Search } = Input;
const _ = require("lodash");

function Inventory() {
  const nowDate = getFormatDate(new Date());
  const curDate = nowDate.full;
  const curMonth = curDate.substr(0,curDate.length-2)
  const db = firebase.database(wel);
  const userInfo = useSelector((state) => state.user.currentUser);
  const [InvenData, setInvenData] = useState();
  const [ProdItemCopy, setProdItemCopy] = useState();
  const formRef = useRef();

  const [SearchMonth, setSearchMonth] = useState(curMonth);
  const onSearchMonth = (date, dateString) => {
    let regex = /-/g
    let month = dateString.replace(regex,"")
    setSearchMonth(month)
  } 

   //키워드 검색
   const [searchInput, setSearchInput] = useState("");
   const [SearchAgain, setSearchAgain] = useState(false)
   const onSearchChange = (e) => {
     setSearchInput(e.target.value);
   };
   const onSearch = () => {
    setSearchAgain(!SearchAgain);
   };

   useEffect(() => {
    if (ProdItemCopy) {
      let regexstring = searchInput;
      let regexp = new RegExp(regexstring, "gi");
      let array = _.cloneDeep(ProdItemCopy);
      if(searchInput != ''){
        array = array.filter(el=>{
          return el.name.match(regexp)
        })
      }
      setInvenData(array);
    }
  }, [SearchAgain])

 

  const columns = [
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
      dataIndex: ['real_date'],
      key: 'real_date',
      align: 'center',  
      width: 100,    
      sorter: {
        compare: (a, b) => b.real_date.timestamp - a.real_date.timestamp,
        multiple: 2,
      },
      defaultSortOrder: 'ascend',
      render: (text,row) => `${row['real_date'].full_}`
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
    {
      title: '삭제',
      dataIndex: ['ea','val','real_date','prod_uid','uid','key'],
      key: 'ea',
      align: 'center',  
      width: 80,    
      render: (text,row) => <>
        <Popconfirm
          title={`삭제하시겠습니까?`}
          onConfirm={()=>onLogDelete(row['ea'],row['val'],row['real_date'],row['prod_uid'],row['uid'],row['key'])}
          onCancel={cancel}
          okText="네"
          cancelText="아니오"
        >
          <Button onClick={()=>onLogDelete(row['ea'],row['val'],row['real_date'],row['prod_uid'],row['uid'],row['key'])}><antIcon.AiOutlineDelete style={{marginTop:"4px"}} /></Button>
        </Popconfirm>
      </>
    },
  ]

  const [ProdItem, setProdItem] = useState();
  const [Category, setCategory] = useState();
  const [SortCate, setSortCate] = useState('all');

  const itemSort = (e) => {
    setSortCate(e.target.value);
  }

  useEffect(() => { 
    db.ref("inventory/category")
    .once("value", snapshot => {
      if(snapshot.val()){
        setCategory(snapshot.val().split(','))
      }
    })

    db.ref('inventory/list')
    .on('value',snapshot => {
      let arr = [];
      snapshot.forEach(el => {
        arr.push(el.val())
      })
      if(SortCate != 'all'){
        arr = arr.filter(el=>{
          return el.category === SortCate;
        })
      }
      arr.sort((a,b)=>{
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      })      
      setInvenData(arr);
      setProdItemCopy(arr);
    })

    db.ref(`inventory/user/${SearchMonth}/${userInfo.uid}`)
    .on("value", snapshot => {
      let arr = [];
      snapshot.forEach(item=>{
        let obj = item.val();
        arr.push(obj)
      })           
      setProdItem(arr)
    })
    return () => {
      db.ref('inventory/list').off()
    }
  }, [SortCate])

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
    const agree = window.confirm('출고 하시겠습니까?\n(수량확인 부탁드립니다)')
    if(!agree){return}
    let ea = parseInt(ModifyUid.ea) - parseInt(values.val);
    if(ea < 0){
      message.error('재고가 부족합니다.');
      return
    }
    let date = values.real_date ? getFormatDate(new Date(values.real_date)) : getFormatDate(new Date());
    values.real_date = date;
    values.comment = values.comment ? values.comment : '';
    const uid = uuid();
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
      key:uid,
      date:getFormatDate(new Date()),
    }

    db.ref(`inventory/log/${curDate}/${uid}`)
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

    db
    .ref(`inventory/user/${monthDate}/${userInfo.uid}/${uid}`)
    .update({
      ...obj
    })

    message.success("출고완료");
    formRef.current.resetFields();
    setIsModalVisible(false);
    setModifyUid("");

  }


  const onLogDelete = (ea,val,date,prod,uid,key) => {
    console.log(ea,val,date.full,prod,uid,key)
    let monthDate = date.full.substr(0,date.full.length-2)
    db
    .ref(`inventory/log_month/${monthDate}/${prod}/output`)
    .transaction(pre=>{
      return pre - parseInt(val);
    }) 

    db
    .ref(`inventory/list/${prod}/ea`)
    .transaction(pre=>{
      return pre - parseInt(val);
    }) 

    db
    .ref(`inventory/log_date/${prod}/${date.full}/ea`)
    .transaction(pre=>{
      return pre - parseInt(val);
    })

    db
    .ref(`inventory/user/${monthDate}/${uid}/${key}`)
    .remove()

    db
    .ref(`inventory/log/${date.full}/${key}`)
    .remove()
  }


  return (
    <>
      {Category && 
      <div className="menuCategory">
        <Radio.Group
          className="menuCategory"
          onChange={itemSort}
          defaultValue="all"
          value={SortCate}
          buttonStyle="solid"
        > 
          <Radio.Button value={'all'}>{`전체`}</Radio.Button>
          {Category.map(el=>(
            <>
              <Radio.Button value={el}>{el}</Radio.Button>
            </>
          ))}
        </Radio.Group>
      </div>
      }
      <Search
        style={{ marginBottom: "20px" }}
        allowClear
        enterButton="검색"
        size="large"
        placeholder="품명으로 검색"
        value={searchInput}
        onSearch={onSearch}
        onChange={onSearchChange}
        type="text"
      />
      {InvenData && 
      <ul className="inven-list-box">
        {InvenData.map((el,idx)=>(
          <li key={idx}>
            <div className="list-con">
              <div className="left">
                {el.image ? <div className="img-box"><img src={el.image} /></div>
                  : <div className="img-box no-img"><bsIcon.BsImage style={{opacity:"0.4"}} /></div>
                }
                <dl className="txt-box">
                  <dt style={{marginBottom:"2px"}}>{el.name}</dt>
                  <dd style={{color:"#555",fontSize:"13px"}}><goIcon.GoLocation style={{fontSize:"14px",position:"relative",top:"2px",marginRight:"3px"}} />{el.place}</dd>
                  <dd style={{color:"#555",fontSize:"13px"}}>
                    {el.etc &&
                    <antIcon.AiOutlineInfoCircle style={{fontSize:"15px",position:"relative",top:"3px",marginRight:"3px"}} />
                    }
                    {el.etc}
                  </dd>
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

      <div className="flex-box a-center" style={{marginTop:"30px",marginBottom:"10px"}}>
        <h3 className="title" style={{marginBottom:"0",marginRight:"10px"}}>비품 출고 내역</h3>
        <DatePicker defaultValue={moment(SearchMonth,'YYYY-MM')} onChange={onSearchMonth} picker="month" style={{marginRight:"5px"}} />
        <span style={{fontSize:"12px",color:"#888"}}>*월별 검색</span>
      </div>
      {ProdItem &&
        <Table 
          columns={columns} 
          dataSource={ProdItem}
        />      
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
