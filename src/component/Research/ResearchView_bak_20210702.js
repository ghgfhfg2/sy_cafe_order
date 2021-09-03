import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import firebase from "../../firebase";
import { Form, Radio, Input, Button, Table, Space } from 'antd';
import { useSelector } from "react-redux";
import Signature from "./Signature";
import Loading from "../Loading";



function ResearchView(props) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ResearchViewInfo, setResearchViewInfo] = useState();
  const [ResultList, setResultList] = useState();
  const [ResultSum, setResultSum] = useState();
  const [Ruser, setRuser] = useState();
  const [Rerender, setRerender] = useState(true);
  const [UserDb, setUserDb] = useState();
  const [MyResearch, setMyResearch] = useState();

  const [sigPadData, setSigPadData] = useState(null);

  const onSigpad = (data) => {
    setSigPadData(data);
  }

  useEffect(() => {
    if(userInfo){
      firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .once("value", (snapshot) => {
        setUserDb(snapshot.val());
      });

      firebase
      .database()
      .ref("research")
      .child(`${props.location.state.uid}/result/${userInfo.uid}`)
      .once("value", (snapshot) => {
        setMyResearch(snapshot.val());
      });
    }

    let resultSum = {};
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
      setResearchViewInfo(snapshot.val())      
      typeof snapshot.val().option != 'object' && snapshot.val().option.forEach(el => {
        resultSum[el.option] = 0;
      })
    });    
    let color = ['#373f92','#1a95ce','#10acb9','#49b963','#c5be26','#f8900b','#f1723b','#de2715','#a14198'];
    firebase.database().ref(`research/${props.location.state.uid}/result`)
    .once("value", (snapshot) => {      
      let resultArr = [];
      let sumArr = [];
      for(let key in resultSum){
        resultSum[key] = 0;
      }
      snapshot.forEach(el => {
        resultSum[el.val().option] += 1;
        resultArr.push(el.val())
      })
      let colNum = 9;
      for(let key in resultSum){        
        let colSel = Math.floor(Math.random() * colNum);
        sumArr.push({
          name: key,
          count: resultSum[key],
          color:color[colSel]
        })
        color = color.filter((el) => el !== color[colSel]);
        colNum -= 1;
      }
      sumArr = sumArr.sort((a,b) => {
        if(a.count < b.count){
          return 1;
        }
        if(a.count > b.count){
          return -1;
        }
        return 0;
      })
      setResultSum(sumArr)
      r_user.map(el => {
        resultArr.map(list => {
          if(el.name == list.name && el.part == list.part){
            const optionValues = Object.values(list.option);
            el.option = optionValues ? optionValues : '';
            el.sign = list.sign ? list.sign : '';
            console.log(el.option)
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
    console.log(values)
    let result = {
      name:userInfo.displayName,
      part:userInfo.photoURL,
      option:values,
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
        <span key={idx}>{el}</span>
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
            <dd>
              {ResearchViewInfo.etc}
              <div style={{marginTop:"10px"}}>
                {ResearchViewInfo.image && ResearchViewInfo.image.map((el,idx) => (
                  <div className="img">
                    <img key={idx} src={el} />
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
                    <div className="flex-box">
                      <span className="tit">{idx+1}. {el.option_q}</span>
                    </div>
                    {el.option_a != '' ? (
                      <Form.Item name={`select_op_${idx}`} label="선택항목" style={{marginBottom:"20px"}}>
                        <Radio.Group >
                          {el.option_a.split(',').map((list,_idx)=>(
                            <Radio key={_idx} value={list}>{list}</Radio>
                          ))}
                        </Radio.Group>
                      </Form.Item>
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
                {ResearchViewInfo && UserDb && UserDb.auth != 'insa' ? (
                  <></>
                  ):(
                  <Button onClick={onResultOpen}>결과보기</Button>
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
        {ResearchViewInfo.type == 1 &&
          <ul className="research-chart">
            {ResultSum && ResultSum.map((el,idx) => (
              <li key={idx} style={{width:`${(el.count/ResultList.length*100).toFixed(1)}%`,backgroundColor:`${el.color}`}}>
                <span>{el.name} </span>
                <span>{el.count}표({el.count ? (el.count/ResultList.length*100).toFixed(1): '0'}%)</span>
              </li>
            ))}
          </ul>
        }
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
