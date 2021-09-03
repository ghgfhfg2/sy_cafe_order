import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Button } from 'antd';
import { Link } from 'react-router-dom'
import firebase from "../../firebase";
import { getFormatDate } from "../CommonFunc"
const curDate = getFormatDate(new Date());

function Research() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ResearchList, setResearchList] = useState()
  const [ReRender, setReRender] = useState(false)
  useEffect(() => {
    let arr = [];
    firebase.database().ref('research')
    .once("value")
    .then((snapshot) => {
      snapshot.forEach(el=>{
        (
          el.val().member_check && el.val().member_check.includes(userInfo.uid) || 
        el.val().alba && userInfo.auth && userInfo.auth.includes('alba') || 
        el.val().intern && userInfo.auth && userInfo.auth.includes('intern')
        ) ? console.log() : 
        arr.push(el.val())
      })
      arr = arr.sort((a,b)=>{
        return b.timestamp - a.timestamp
      })
      setResearchList(arr)
    })
    return () => {
      
    }
  }, [ReRender])
  

  const onDelete = (uid) => {
    let a = window.confirm('이 게시물을 삭제 하시겠습니까?')
    if(a){
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
      firebase.database().ref(`research/${uid}`)
      .remove()
      setReRender(!ReRender)
    }
  }
  
  return (
    <>
      <ul className="board-basic research">
          <li key="0" className="tit">
            <div className="info-box">
              <span className="date limit">기한</span>
              <span className="state">상태</span>
              <span className="subject">제목</span>
            </div>
            <div className="right-box">
              <span className="date">날짜</span>
              {userInfo && userInfo.auth && userInfo.auth.includes('insa') &&
                <span className="admin"></span>
              }
            </div>
          </li>        
          {ResearchList && ResearchList.map((el,idx) => (
            <li key={idx+1} >
              <div className="info-box">
                <span className="date limit">
                  {el.limit_start == 0 && 
                    <>
                    무기한
                    </>
                  }
                  {el.limit_start != 0 && 
                    <>
                    {getFormatDate(new Date(el.limit_start)).full_} ~ {getFormatDate(new Date(el.limit_end)).full_}
                    </>
                  }
                </span>
                {el.limit_start < new Date().getTime() && 
                 el.limit_end > new Date().getTime() && 
                 <span className="state con"><span>진행</span></span>
                }
                {el.limit_start > new Date().getTime() && 
                  <span className="state con yet"><span>예정</span></span>
                }
                {el.limit_end < new Date().getTime() && 
                  <span className="state con end"><span>마감</span></span>
                }
                <span className={`subject`}>
                  <Link to={{
                    pathname: `/research_view`,
                    state: {
                      uid:el.uid
                    }
                  }}
                    >{el.title}
                  </Link>
                </span>
              </div>
              <div className="right-box">
                <span className="date">{el.date}</span>
                {userInfo && userInfo.auth && userInfo.auth.includes('insa') && 
                  <span className="admin">                    
                    <Button onClick={()=>{onDelete(el.uid)}}>삭제</Button>
                  </span>
                }
              </div>
            </li>
          ))}
      </ul>
      {userInfo && userInfo.auth && userInfo.auth.includes('insa') &&
      <div style={{textAlign:"right",marginTop:"15px"}}>
        <Button style={{width:"100px"}} type="primary">
          <Link to="/research_write">게시물 등록</Link>
        </Button>
      </div>
      }
    </>
  )
}

export default Research
