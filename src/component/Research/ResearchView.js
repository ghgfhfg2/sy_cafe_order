import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import firebase from "../../firebase";
import { Form, Radio, Input, Button, Table, Space, Checkbox } from 'antd';
import { useSelector } from "react-redux";
import Signature from "../Signature";
import Loading from "../Loading";
import { getFormatDate } from "../CommonFunc";



function ResearchView(props) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ResearchViewInfo, setResearchViewInfo] = useState();
  const [ResultList, setResultList] = useState();
  const [Ruser, setRuser] = useState();
  const [Rerender, setRerender] = useState(true);
  const [MyResearch, setMyResearch] = useState();

  const [sigPadData, setSigPadData] = useState(null);

  const onSigpad = (data) => {
    setSigPadData(data);
  }

  useEffect(() => {
    if(userInfo){

      firebase
      .database()
      .ref("research")
      .child(`${props.location.state.uid}/result/${userInfo.uid}`)
      .once("value", (snapshot) => {
        setMyResearch(snapshot.val());
      });
    }

    async function getResearch(){
    let r_user = []
    await firebase.database().ref('users')
    .once('value', (snapshot) => {
      snapshot.forEach(el => {
        if(el.val().role >= "0"){
            r_user.push({
            name: el.val().name,
            part: el.val().part,
            role: el.val().role
          })
        }
      });
      setRuser(r_user);
    })  
    await firebase.database().ref('research')
    .child(props.location.state.uid)
    .once("value", (snapshot) => {
      console.log(snapshot.val())
      setResearchViewInfo(snapshot.val())      
    });    

    firebase.database().ref(`research/${props.location.state.uid}/result`)
    .once("value", (snapshot) => {      
      let resultArr = [];
      snapshot.forEach(el => {
        resultArr.push(el.val())
      })

      r_user.map(el => {
        resultArr.map(list => {
          if(el.name == list.name && el.part == list.part){
            const optionValues = Object.values(list.option);
            el.option = optionValues ? optionValues : '';
            el.sign = list.sign ? list.sign : '';
          }
        })
      })
      setResultList(r_user)
    })};
    getResearch();
    return () => {      
    }
  }, [Rerender])

  useEffect(() => {
    if(!ResultList){
      setTimeout(() => {
        setRerender()
      },1000)
    }
    return () => {
    }
  }, [])


  const [ResultOpen, setResultOpen] = useState(false);
  const onResultOpen = () => {
    setResultOpen(true);
  }

  const [Again, setAgain] = useState(false);
  const onResearchAgain = () => {
    setAgain(true)
  }
  

  const onFinish = (values) => {
    const optionValues = Object.values(values);
    let result = {
      name:userInfo.displayName,
      part:userInfo.photoURL,
      option:optionValues,
      sign:sigPadData ? sigPadData : ''
    };
    firebase.database().ref(`research/${props.location.state.uid}/result/${userInfo.uid}`)
    .update({...result})
    setRerender(!Rerender)
    setAgain(false)
  }

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      align: 'center'
    },
    {
      title: '부서',
      dataIndex: 'part',
      key: 'part',
      align: 'center',
    },
    {
      title: '답변',
      dataIndex: 'option',
      key: 'option',
      align: 'center',
      render: data => data ? 
      data.map((el,idx)=>(
        <>
        <p style={{textAlign:"left",lineHeight:"1.6",marginBottom:"0"}} key={idx}>{idx+1}. {el} </p>
        </>
      )) : ''       
      ,
    },
    {
      title: '서명',
      dataIndex: 'sign',
      key: 'sign',
      align: 'center',
      render: data => data ? <img style={{height:"40px"}} src={data} /> : '',
    },
  ]

  const [Refesh, setRefesh] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setRefesh(true)
    },2000)
    return () => {
    }
  }, [])
  const onRerender = () => {
    setRerender(!Rerender)
  }


  return (
    <>
      {ResultList && 
        <>
        <Form
        name="validate_other"
        onFinish={onFinish}
        >
          <dl className="board-view-basic">
            <dt>{ResearchViewInfo.title}</dt>
            <dd className="flex-box">
              기한 :&nbsp; 
              {ResearchViewInfo.limit_start > 0 &&
              <>
              <div>
                  {getFormatDate(new Date(ResearchViewInfo.limit_start)).full_}&nbsp; 
                  {getFormatDate(new Date(ResearchViewInfo.limit_start)).hour}: 
                  {getFormatDate(new Date(ResearchViewInfo.limit_start)).min}
              </div>
              &nbsp;~&nbsp;
              <div>
                {getFormatDate(new Date(ResearchViewInfo.limit_end)).full_}&nbsp; 
                {getFormatDate(new Date(ResearchViewInfo.limit_end)).hour}: 
                {getFormatDate(new Date(ResearchViewInfo.limit_end)).min}
              </div>
              </>
              }
              {ResearchViewInfo.limit_start === 0 && <>무기한</>}
            </dd>
            <dd>
              {ResearchViewInfo.etc}
              <div style={{marginTop:"10px"}}>
                {ResearchViewInfo.image && ResearchViewInfo.image.map((el,idx) => (
                  <div className="img">
                    <img key={idx} src={el.url} />
                  </div>
                ))}
              </div>
            </dd>            
            {MyResearch && !Again ? (
              <div className="my-answer">
                <h4>참여완료</h4>
                <div>내 답변 : <span>{MyResearch.option}</span></div>
                <Button style={{marginTop:"10px"}} onClick={onResearchAgain}>다시 참여하기</Button>
              </div>
            ):(
            <dd>
              {ResearchViewInfo.type == 1 &&
                <Form.Item name="select_op" label="선택항목">
                  <Radio.Group >
                    {ResearchViewInfo.option.map((el,idx) => (
                      <>
                        <Radio key={idx} value={el.option}>{el.option}</Radio>
                      </>
                    ))}
                  </Radio.Group>
                </Form.Item>
              }
              {ResearchViewInfo.type == 2 && 
                <Form.Item name="select_op">
                  <div className="flex-box">
                    <span className="tit">답변</span>
                    <Input />
                  </div>
              </Form.Item>
              }
              {ResearchViewInfo.type == 3 && 
                ResearchViewInfo.option.map((el,idx)=>(
                  <>
                    <div style={{marginBottom:"10px"}}>
                      <span className="tit">{idx+1}. {el.option_q}</span>
                      <div className="flex-box" style={{marginBottom:"10px"}}>
                      {el.option_photo && el.option_photo.map((img,_idx) => (
                        <div style={{margin:"0 5px"}}>
                          <img src={img.url} />
                        </div>
                      ))}
                      </div>
                    </div>
                    {el.option_a != '' ? (
                      <>
                      {el.option_type == '1' &&
                      <Form.Item name={`select_op_${idx}`} label="선택항목" style={{marginBottom:"20px"}}>
                        <Checkbox.Group >
                          {el.option_a.split(',').map((list,_idx)=>(
                            <Checkbox key={_idx} value={list}>{list}</Checkbox>
                          ))}
                        </Checkbox.Group>
                      </Form.Item>
                      }
                      {el.option_type == '2' &&
                      <Form.Item name={`select_op_${idx}`} label="선택항목" style={{marginBottom:"20px"}}>
                        <Radio.Group >
                          {el.option_a.split(',').map((list,_idx)=>(
                            <Radio key={_idx} value={list}>{list}</Radio>
                          ))}
                        </Radio.Group>
                      </Form.Item>
                      }
                      </>
                    ):(
                      <Form.Item name={`select_op_${idx}`} style={{marginBottom:"20px"}}>
                          <div className="flex-box">
                            <span className="tit">답변</span>
                            <Input />
                          </div>
                      </Form.Item>
                    )}
                  </>
                ))
              }
              <div className="flex-box">
                <span className="tit">서명</span>
                <Signature onSigpad={onSigpad} />
              </div>
            </dd>            
            )
            }
              
             
            
            <div className="btn-box">
              <Space align="center">
                {!Again && MyResearch ? (
                  <></>
                ):(
                  <Button htmlType="submit" type="primary">참여하기</Button>
                )}
                {ResearchViewInfo && userInfo && !userInfo.auth.includes('insa') ? (
                  <></>
                  ):(
                  <>
                  <Button onClick={onResultOpen}>결과보기</Button>
                  <Button>
                    <Link to={{
                      pathname: `/research_modify`,
                      state: {
                        uid:ResearchViewInfo.uid
                      }
                    }}
                      >수정
                    </Link>
                  </Button>
                  </>
                )}
                <Button>
                  <Link to="/research">목록으로</Link>
                </Button>
              </Space>
            </div>
          </dl>
        </Form>
        
      
      {Ruser && ResultList && ResultOpen &&
        <>
        <Table pagination={false} align="center" columns={columns} dataSource={ResultList} />        
        </>
      }
      </>
      }
      {!ResultList && 
        <>     
          {!Refesh &&
          <Loading />
          }
          {Refesh &&
            <Button className="pos-center" type="button" onClick={onRerender}>새로고침</Button>
          }
        </>
      }  
    </>
  )
}

export default ResearchView
