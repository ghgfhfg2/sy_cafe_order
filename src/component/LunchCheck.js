import React, { useState, useEffect, useRef } from 'react';
import { getFormatDate } from './CommonFunc';
import { Checkbox, Button, Modal, message } from "antd";
import firebase from "../firebase";
import { useSelector } from "react-redux";
import * as antIcon from "react-icons/ai";




function LunchCheck() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const curDate = getFormatDate(new Date());
  const weekNum = curDate.weekNum;
  let date = new Date();
  let hour = date.getHours();
  let min = date.getMinutes();
  min = min < 10 ? '0'+min : min;
  let limitTime = ''+hour+min;
  new Date(date.setDate(date.getDate() - weekNum + 7));
  let curWeekArr = [];
  let i = 0;
  while(i < 7){
    curWeekArr.push(getFormatDate(new Date(date.setDate(date.getDate() - 1))));
    i++;
  }
  curWeekArr = curWeekArr.sort((a,b) => {
    if(a.full < b.full){
      return -1;
    }
  });
  curWeekArr.pop();
  curWeekArr.shift();
  
  date = new Date();
  new Date(date.setDate(date.getDate() - weekNum));
  let prevWeekArr = [];
  let n = 0;
  while(n < 7){
    prevWeekArr.push(getFormatDate(new Date(date.setDate(date.getDate() - 1))));
    n++;
  }
  prevWeekArr = prevWeekArr.sort((a,b) => {
    if(a.full < b.full){
      return -1;
    }
  });
  prevWeekArr.pop();
  prevWeekArr.shift();
  
  date = new Date();
  new Date(date.setDate(date.getDate() + (6-weekNum)));
  let nextWeekArr = [];
  let j = 0;
  while(j < 14){
    if(j==6){
      nextWeekArr.push(getFormatDate(new Date(date.setDate(date.getDate() + 3))));
    }else{
      nextWeekArr.push(getFormatDate(new Date(date.setDate(date.getDate() + 1))));
    }
    
    j++;
  }
  nextWeekArr.pop();
  nextWeekArr.pop();
  nextWeekArr.pop();
  nextWeekArr.shift();

  
  const weekList = useRef();
  const weekList2 = useRef();
  const weekList3 = useRef();
  
  const [ItemList, setItemList] = useState();
  const [UserList, setUserList] = useState();
  const [ItemInfo, setItemInfo] = useState();
  const [PrevState, setPrevState] = useState()
  const [CurState, setCurState] = useState()
  const [NextState, setNextState] = useState()

  useEffect(() => {

      firebase.database().ref('lunch/item')
      .on('value', (snapshot) => {
        let arr = [];
        snapshot.forEach(el => {
          arr.push(el.val())
        })
        setItemList(arr)
      });
      firebase.database().ref('lunch/info')
      .on('value', (snapshot) => {
        setItemInfo(snapshot.val())        
      });
      firebase.database().ref(`lunch/user/${userInfo.uid}/checkList`)
      .on('value', (snapshot) => {
        let arr = [];
        snapshot.forEach(el => {
          console.log(el.val())
          arr.push({
            date: el.val().date,
            item: el.val().item,
            confirm: el.val().confirm ? el.val().confirm : '',
            admin_check: el.val().admin_check ? el.val().admin_check : false,
          })
        })
        setUserList(arr);
        prevWeekArr.map((el,idx) => {
          arr.map((list,idx) => {
            if(el.full == list.date){
              el.item = list.item ? list.item.join(',') : '';
              el.confirm = list.confirm;
            }
          })
        })
        curWeekArr.map((el,idx) => {
          arr.map((list,idx) => {
            if(el.full == list.date){
              el.item = list.item ? list.item.join(',') : '';
              el.confirm = list.confirm;
              el.admin_check = list.admin_check;
            }
          })
        })
        nextWeekArr.map((el,idx) => {
          arr.map((list,idx) => {
            if(el.full == list.date){
              el.item = list.item ? list.item.join(',') : '';
              el.confirm = list.confirm;
            }
          })
        })
        
        
        setPrevState(prevWeekArr);
        setCurState(curWeekArr);
        setNextState(nextWeekArr);
      })
      
    
  

    return () => {
      firebase.database().ref('lunch/item').off();
      firebase.database().ref(`lunch/user/${userInfo.uid}/checkList`).off();
    }
  }, []);


  const [LunchImg, setLunchImg] = useState()
  const [LunchImgVisible, setLunchImgVisible] = useState(false)
  useEffect(() => {
    firebase.database().ref('lunch/img')
    .on("value",data => {
      setLunchImg(data.val())
    })
    return () => {
      firebase.database().ref('lunch/img').off()
    }
  }, [])
  const onLunchImg = () => {
    setLunchImgVisible(true)
  }
  const LunchImgCancel = () => {
    setLunchImgVisible(false)
  }

  const onsubmit = () => {
    let list = [...weekList.current.querySelectorAll('li'),...weekList2.current.querySelectorAll('li'),...weekList3.current.querySelectorAll('li')];    
    let checkList = {};
    list.map(el => {
      let check = [...el.querySelectorAll('input[type=checkbox]:checked')];
      let confirm = el.querySelector('input[type=hidden]');
      
      check = check.map(el=>el.dataset.value)
      checkList[el.dataset.date] = {
        item: check,
        date:el.dataset.date,
        confirm:confirm.value
      }        
    })
    
    firebase.database().ref(`lunch/user/${userInfo.uid}`)
    .update({
      checkList,
      name : userInfo.displayName,
      part : userInfo.photoURL
    })
    message.success('적용되었습니다 :)');
    setModifyState(false)
  }

  const onTodayCheck = (date) => {
    firebase.database().ref(`lunch/user/${userInfo.uid}/checkList/${date}`)
    .update({
      confirm:1
    })
  }

  const [ModifyState, setModifyState] = useState(false)
  const onModify = () => {
    setModifyState(true)
  }

  const onCancel = () => {
    setModifyState(false)
  }
  

  return (
    <>
      <div className="item-info-box">
        {ItemInfo && 
          <pre>{ItemInfo}</pre>
        }
      </div>
      <ul className="week_list" ref={weekList}>
        {PrevState && PrevState.map((el,idx) => (
          <li key={idx} data-date={el.full}>
            <input type="hidden" name="check" value={el.confirm ? el.confirm : ""} />
              <span className="date">
                {`${el.month}.${el.day}(${el.week})`}
              </span>
              {!ModifyState &&
                <>
                  <div className="item-info">
                    {`${el.item ? el.item : ''}`}
                  </div>
                  <div className="confirm-info">
                  {el.full != curDate.full &&
                    <>
                      {el.confirm ? <span>확인완료</span> : <span>미확인</span>} 
                    </>
                  }
                  </div>
                </> 
              }
            <div className={`check-list-box ${ModifyState && 'modify'}`}>
              {ItemList && ModifyState && 
              ItemList.map((list,l_idx) => (
                <>
                {userInfo.auth && userInfo.auth == 'alba' && ItemList.length == l_idx+1 ? (
                  <></>
                ) : (
                  <Checkbox key={l_idx} data-value={list} disabled defaultChecked={el.item && el.item.includes(list) ? true : false}>{list}</Checkbox>
                )}
                </>
              ))                  
              }
            </div>  
          </li>
        ))}
      </ul>
      <ul className="week_list" ref={weekList2}>
        {CurState && CurState.map((el,idx) => (
          <li key={idx} data-date={el.full} className={el.full == curDate.full ? 'today' : ''}>
            <span className="date">
                {`${el.month}.${el.day}(${el.week})`}
            </span>
            {!ModifyState &&
              <>
              <div className="item-info">
                    {`${el.item ? el.item : ''}`}
                  </div>
                
              <div className="confirm-info">
              {el.confirm && <span>확인완료</span>}
              {el.admin_check && <>(관리자)</>}
              {el.full != curDate.full && !el.confirm &&
                <span>미확인</span>
              }
              </div>
                
              {el.full == curDate.full &&
                <>
                {!el.confirm && 
                <>
                  <Button type="primary" disabled={!el.item ? true : limitTime < 930 ? false : true}  onClick={()=>{onTodayCheck(el.full)}}>
                    {el.item ? '식단확인' : '확인불가'}
                  </Button>
                </>
                }
                </>
              }
              </> 
            } 
            <div className={`check-list-box ${ModifyState && 'modify'}`}>
              {ItemList && ModifyState && 
              ItemList.map((list,l_idx) => (
                <>
                  {userInfo.auth && userInfo.auth == 'alba' && ItemList.length == l_idx+1 ? (
                  <></>
                ) : (
                  <Checkbox key={l_idx} data-value={list} disabled={
                    el.full > curDate.full ? 
                    false : el.full == curDate.full && limitTime < 930 ? false : true
                  } defaultChecked={el.item && el.item.includes(list) ? true : false}>{list}</Checkbox>
                )}
              </>
              ))            
              }
            </div>
            <input type="hidden" name="check" value={el.confirm ? el.confirm : ""} />            
          </li>
        ))}
      </ul>  

      <ul className="week_list next" ref={weekList3}>
        {NextState && NextState.map((el,idx) => (
          <li key={idx} data-date={el.full}>
          <input type="hidden" name="check" value={el.confirm ? el.confirm : ""} />
            <span className="date">
              {`${el.month}.${el.day}(${el.week})`}
            </span>
            {!ModifyState &&
              <>
                <div className="item-info">
                    {`${el.item ? el.item : ''}`}
                  </div>
                <div className="confirm-info">
                {el.full != curDate.full &&
                  <>
                    {el.confirm ? <span>확인완료</span> : <span>미확인</span>} 
                  </>
                }
                </div>
              </> 
            }
          <div className={`check-list-box ${ModifyState && 'modify'}`}>
            {ItemList && ModifyState && 
            ItemList.map((list,l_idx) => (
              <>
                {userInfo.auth && userInfo.auth == 'alba' && ItemList.length == l_idx+1 ? (
                  <></>
                ) : (
                <Checkbox key={l_idx} data-value={list} defaultChecked={el.item && el.item.includes(list) ? true : false}>{list}</Checkbox>    
                )}
              </>
            ))                  
            }
          </div>  
        </li>
        ))}
      </ul>  
     
      <div className="lunch-btn-box">
        {LunchImg && 
          <>
            <Button style={{marginRight:"5px"}} onClick={onLunchImg}>
              식단표
            </Button>
            <Modal title="식단표" 
            visible={LunchImgVisible} 
            footer={null}
            width="auto"
            centered
            className="lunch-img-modal"
            onCancel={LunchImgCancel}>
              <img src={LunchImg.img.url} />
            </Modal>
          </>
        }
        {!ModifyState &&
          <Button type="primary" onClick={onModify}>수정하기</Button>
        }
        {ModifyState &&
          <>
          <Button type="primary" onClick={onsubmit}>적용하기</Button>
          <Button style={{marginLeft:"5px"}} onClick={onCancel}>취소</Button>
          </>
        }
      </div>

      
    </>
  )
}

export default LunchCheck
