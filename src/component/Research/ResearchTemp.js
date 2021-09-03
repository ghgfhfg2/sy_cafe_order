import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Form, Input, Button, Space, Radio, Checkbox, Upload, Switch, DatePicker, Select, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import uuid from "react-uuid";
import firebase from "../../firebase";
import { getFormatDate } from "../CommonFunc";
import moment from 'moment';
const { RangePicker } = DatePicker;
function ResearchTemp(props) {
  const userInfo = useSelector((state) => state.user.currentUser);

  const [TotalUser, setTotalUser] = useState()
  const [ResearchViewInfo, setResearchViewInfo] = useState();
  const [onMember, setOnMember] = useState(false)  
  const [TypeState, setTypeState] = useState()
  useEffect(() => {
    let userArr = [];
    firebase
    .database()
    .ref("users")
    .once("value", (snapshot) => {
      snapshot.forEach(el=>{
        userArr.push({
          uid:el.key,
          auth:el.val().auth ? el.val().auth : "",
          name:el.val().name,
          part:el.val().part,
          role:el.val().role
        })
      })
      userArr.sort((a,b)=>{
        return a.part < b.part ? -1 : 1 
      })
      setTotalUser(userArr);
    });
    firebase.database().ref(`research_temp/${userInfo.uid}/${props.location.state.uid}`)
    .once("value", snapshot => {
      let res = snapshot.val();
      if(snapshot.val() && snapshot.val().image){
        let uploadArr = [];
        snapshot.val().image.map((el,idx)=>{
          uploadArr.push({
            uid:idx,
            name:el.name,
            status:'done',
            url:el.url
          })
        })
        res.upload = uploadArr
      }      
      setOnMember(res.member)
      setTypeState(res.type)
      setResearchViewInfo(res)
    })

    return () => {      
    }
  }, [])

  const btnToList = useRef();

  const uid = uuid();

  const disabledDate = (current) => {
    return current && current < moment().subtract(1, 'days');
  }

  const [DateLimitState, setDateLimitState] = useState(false)
  const dateLimit = () => {
    setDateLimitState(!DateLimitState)
  }  

  let newUid = uuid();
  const finishDataSave = (values) => {
    
    let uploadURL = values.upload ? values.upload : [];   
    const getImgUrl = async () => {
    values.upload && values.upload.map(el=>{
    if(el.originFileObj){
      let getImg = async () => {
      let uploadTask = await firebase
          .storage()
          .ref("research")
          .child(`image/${uid}/${newUid}`)          
          .put(el.originFileObj, el.type);
            uploadTask.ref.getDownloadURL()
            .then(url => {
              uploadURL.push({                
                name:el.originFileObj.name,
                url:url
              });
              firebase.database().ref('research')
              .child(uid)
              .update({
                image: uploadURL
              });                       
            });
          }
        getImg();
      }else{
        uploadURL = ""
        firebase.database().ref('research')
        .child(uid)
        .update({
          image: uploadURL
        }); 
      }
      })
    }
    getImgUrl(); 
      firebase.database().ref('research')
      .child(uid)
      .update({
        title:values.title,
        type:values.type,
        option:values.option_list ? values.option_list : '',
        member:values.member ? values.member : false,
        member_check:values.member_check ? values.member_check : '',
        etc:values.etc ? values.etc : '',
        uid:uid,
        alba:values.alba ? values.alba : false,
        intern:values.intern ? values.intern : false,
        secret:values.secret ? values.secret : false,
        date:getFormatDate(new Date()).full_,
        timestamp:new Date().getTime(),
        limit_start:values.time_limit ? values.time_limit[0]._d.getTime() : 0,
        limit_end:values.time_limit ? values.time_limit[1]._d.getTime() : 99999999999999,
      });
    }      

 
  
  const onFinish = async (values) => {
    if(values.type != 2){
      let listLength = values.option_list.length;
      let count = 0;
      const ref = firebase.storage().ref(`research/image/${uid}`);
      ref.listAll()
      .then(dir => {
        const images = dir._delegate.items;
        images.map(el=>{
            let path = el._location.path_;
            firebase.storage().ref(`${path}`).delete()
            .then(()=>{
            }).catch(error=>console.error(error))
          })
        })
      let urlArr = [];
      values.option_list && values.option_list.map(el=>{
        el.option_photo = el.option_photo ? el.option_photo : "";
        el.option_a = el.option_a ? el.option_a : "";
        el.option_type = el.option_type ? el.option_type : "";
        count++;    
        const getOptionImgUrl = (photo) => {
            if(!photo){
              if(count == listLength){
                finishDataSave(values);
                btnToList.current && btnToList.current.click();
              }
            }else{
            photo.map((list,idx)=>{
              if(list.originFileObj){
                let getImg = async () => {
                let uploadTask = await firebase
                .storage()
                .ref("research")
                .child(`image/${uid}/${uuid()}`)          
                .put(list.originFileObj, list.type);
                  uploadTask.ref.getDownloadURL()
                  .then(url => {
                    urlArr.push({
                      uid:idx,
                      status:"done",
                      name:list.originFileObj.name,
                      url:url
                    });
                    firebase.database().ref('research')
                    .child(`${uid}/option/${idx}`)
                    .update({
                      option_photo: urlArr
                    });                
                    el.option_photo = urlArr ? urlArr : '';                
                    if(count == listLength){
                      finishDataSave(values);
                      btnToList.current && btnToList.current.click();
                    }
                  });
                }
                getImg();              
              }else{
                finishDataSave(values);
                btnToList.current && btnToList.current.click();
              }
              })
            }          
          }
        getOptionImgUrl(el.option_photo);
        el.option_photo = el.option_photo ? el.option_photo : '';
      })
    }else{
      finishDataSave(values);
      btnToList.current && btnToList.current.click();
    }
      
  };




  const typeOptions = [
    {label: '선다형', value: 1},
    {label: '서술형', value: 2},
    {label: '복합형', value: 3}
  ]
  const onChangeType = (e) => {
    setTypeState(e.target.value)
  }

  const normFile = (e) => {
    console.log(e)
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onSelectChange = (e) => {
    console.log(e)
  }



  const onMemberChange = (e) => {
    setOnMember(!onMember)
  }


  return (
    <>     
      {ResearchViewInfo &&
      <Form name="dynamic_form_nest_item" className="research-form" onFinish={onFinish} autoComplete="off"
        initialValues={{
          title:ResearchViewInfo.title,
          type:ResearchViewInfo.type,
          upload:ResearchViewInfo.upload,
          alba:ResearchViewInfo.alba,
          intern:ResearchViewInfo.intern,
          secret:ResearchViewInfo.secret,
          member:ResearchViewInfo.member,
          member_check:ResearchViewInfo.member_check,
          option_list:ResearchViewInfo.option,
          etc:ResearchViewInfo.etc,
        }}
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: '제목을 입력해 주세요.'}]}
        >
          <Input placeholder="제목" />
        </Form.Item> 
        <Form.Item 
          name="type"
          label="유형 선택"
          rules={[{ required: true, message: '타입을 선택해 주세요.'}]}
        >
          <Radio.Group
            options={typeOptions}
            onChange={onChangeType}
            value={TypeState}
            optionType="button"
          />
        </Form.Item>
        {TypeState && TypeState == 1 &&
          <Form.List name="option_list">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 5 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'option']}
                      fieldKey={[fieldKey, 'option']}
                      rules={[{ required: true, message: '항목을 입력해 주세요.' }]}
                    >
                      <Input placeholder="항목" />
                    </Form.Item>                  
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        }
        {TypeState && TypeState == 3 &&
          <Form.List name="option_list">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 5 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'option_q']}
                      fieldKey={[fieldKey, 'option_q']}
                      rules={[{ required: true, message: '질문을 입력해 주세요.' }]}
                    >
                      <Input placeholder="질문" />
                    </Form.Item>     
                    <Form.Item 
                      label="유형선택"
                      {...restField}
                      name={[name, 'option_type']}
                      fieldKey={[fieldKey, 'option_type']}
                    >
                      <Select defaultValue="0" onChange={onSelectChange}>
                        <Select.Option value="0">서술형</Select.Option>
                        <Select.Option value="1">체크형</Select.Option>
                        <Select.Option value="2">선택형</Select.Option>
                      </Select>
                    </Form.Item> 
                    <Form.Item
                      {...restField}
                      name={[name, 'option_a']}
                      fieldKey={[fieldKey, 'option_a']}
                    >
                      <Input placeholder="항목이 있을때만 ,로 구분 하여 작성" />
                    </Form.Item> 
                    <Form.Item
                      {...restField}
                      name={[name, 'option_photo']}
                      label="이미지 업로드"
                      fieldKey={[fieldKey, 'option_photo']}
                      getValueFromEvent={normFile}                      
                    >
                      <Upload name="option_upload" listType="picture">
                        <Button icon={<UploadOutlined />}>Click to upload</Button>
                      </Upload>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        }        
        <Form.Item
          name="upload"
          label="이미지 업로드"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload name="logo" listType="picture">
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>
        <div className="flex-box">
          <Form.Item
            name="alba"
            valuePropName="checked"
            style={{marginRight:"13px"}}
          >
            <Checkbox>알바 제외</Checkbox>
          </Form.Item> 
          <Form.Item
            name="intern"
            valuePropName="checked"
            style={{marginRight:"13px"}}
          >
            <Checkbox>인턴 제외</Checkbox>
          </Form.Item> 
          <Form.Item
            name="secret"
            valuePropName="checked"            
            style={{marginRight:"13px"}}
          >
            <Checkbox>결과 비공개</Checkbox>
          </Form.Item>
          <Form.Item
            name="member"
            valuePropName="checked"
            onChange={onMemberChange}
          >
            <Checkbox>제외 선택</Checkbox>
          </Form.Item> 
        </div>
        {onMember &&
          <>
            <Form.Item name="member_check">
              <Checkbox.Group>
                <Row>                
                {TotalUser && TotalUser.map((el,idx)=>(
                  <Col span={4}>
                    <Checkbox key={idx} value={el.uid}>{el.name}({el.part})</Checkbox>
                  </Col>
                ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </>
        }
        <Form.Item
          name="etc"          
          rules={[{ required: true}]}
        >
          <Input.TextArea placeholder="설명" />
        </Form.Item>  
        <Form.Item
          label="날짜설정" style={{marginBottom:"7px"}}
        >
          <Switch onChange={dateLimit} />
        </Form.Item>
        {DateLimitState &&
          <Form.Item
            name="time_limit"
          >
            <RangePicker  
              showTime 
              disabledDate={disabledDate} 
            />
          </Form.Item>
        }

        <div className="flex-box j-center" style={{marginTop:"15px"}}>
          <Button type="primary" htmlType="submit" style={{width:"100px"}}>
            등록하기
          </Button>
          <Button style={{marginLeft:"5px"}}>
            <Link ref={btnToList} to="/research">목록으로</Link>
          </Button>
        </div>    
      </Form>
      }
    </>
  )
}

export default ResearchTemp
