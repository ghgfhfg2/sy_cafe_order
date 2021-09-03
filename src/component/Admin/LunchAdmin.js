import React, { useState, useEffect } from 'react';
import { Input,Button,DatePicker } from 'antd';
import firebase from "../../firebase";
import { getFormatDate } from '../CommonFunc';
import moment from 'moment';
const { TextArea } = Input;
const curDate = getFormatDate(new Date());

function LunchAdmin() {

  const [ItemList, setItemList] = useState();
  const [CheckInfoTxt, setCheckInfoTxt] = useState();
  const [TblItem, setTblItem] = useState();
  const [CheckList, setCheckList] = useState();
  const [ItemSum, setItemSum] = useState();

  const [SearchDate, setSearchDate] = useState(curDate);
  const [CheckLength, setCheckLength] = useState();

  const [Ruser, setRuser] = useState();
  const [NonChecker, setNonChecker] = useState();

  const [Render, setRender] = useState(true)

  useEffect(() => {
    let r_user = []
    firebase.database().ref('users')
    .once('value', (snapshot) => {
      snapshot.forEach(el => {
        if(el.val().role == "0"){
            r_user.push({
            name: el.val().name,
            part: el.val().part,
            role: el.val().role,
          })
        }
      });
      
      setRuser(r_user);
    })
    let itemArr = [];
    let itemObj = {};
    firebase.database().ref('lunch/item')
    .once('value', (snapshot) => {
      snapshot.forEach(el => {
        itemArr.push(el.val())
      });
      itemArr.map(el=>{
        itemObj[el] = 0;
      })
      setTblItem(itemArr);
      itemArr = itemArr.join(',');      
      setItemList(itemArr)
    })
    firebase.database().ref('lunch/info')
      .on('value', (snapshot) => {
        setCheckInfoTxt(snapshot.val())        
    });
    firebase.database().ref('lunch/user')
    .once('value', (snapshot) => {
      let arr = [];
      snapshot.forEach(el => {
        let elItemArr;
        if(el.val().checkList && el.val().checkList[SearchDate.full]){
          elItemArr = el.val().checkList[SearchDate.full].item;
        }
        if(elItemArr){
          elItemArr.map(el=>{
          itemObj[el] += 1;
          })       
          arr.push({
            uid: el.key,
            name: el.val().name,
            part: el.val().part,
            item: elItemArr,
            confirm: el.val().checkList[SearchDate.full].confirm,
          })
        }
      })
      setCheckLength(arr.length)
      setCheckList(arr);
      setItemSum(itemObj);
      let checker = [];
      let allName = [];
      let nonChecker = [];
      Ruser && Ruser.map(el => {
        allName.push(el.name);
        arr.map(list => {
          if(list.name.includes(el.name) && list.part.includes(el.part)){
            checker.push(list.name)
          }
        })
      })
      nonChecker = allName.filter(el => {
        return !checker.includes(el);
      })
      setNonChecker(nonChecker);
    })


    return () => {
    }
  }, [SearchDate,Ruser,Render])

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      let arr;
      arr = e.target.item.value.split(',');      
      firebase.database().ref('lunch')
      .update({
        item:arr,
        info:e.target.check_info_txt.value
      })

    }catch (error) {
      console.error(error);
    }
  }

  const onSelectDate = (date, dateString) => {
    setSearchDate(getFormatDate(date._d))
  }

  const disabledDate = (current) => {
    return current && current > moment().add(14, 'days');
  }

  const onConfrim =(user) => {
    let date = SearchDate.full;
    try {
      firebase.database().ref(`lunch/user/${user.uid}/checkList/${date}`)
      .update({
        confirm: 1
      })
      setRender(!Render)
    }catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {ItemList && 
        <>
          <form onSubmit={onSubmit}>
            <h3 className="title" style={{ margin: "0 0 5px 0" }}>
              식단 항목
            </h3>
            <div className="flex-box">
              <Input name="item" defaultValue={ItemList} />
            </div>
            <h3 className="title" style={{ margin: "15px 0 5px 0" }}>
              항목 설명글
            </h3>
            {CheckInfoTxt &&
            <div className="flex-box">
              <TextArea name="check_info_txt" defaultValue={CheckInfoTxt} />              
            </div>
            }
            <div style={{textAlign:"center"}}>
              <Button
                      htmlType="submit"
                      type="primary"
                      size="large" 
                      style={{marginTop:"10px"}}               
                    >
                      설정저장
              </Button>
            </div>
          </form>
        </>
      }
      <h3 className="title" style={{ margin: "20px 0 5px 0" }}>
        식단체크
      </h3>
      <div className="flex-box">
        <DatePicker 
          format="YYYY-MM-DD"
          defaultValue={moment()}
          disabledDate={disabledDate} onChange={onSelectDate} 
        />
      </div>
      <table className="fl-table tbl-lunch-check" style={{marginTop:"12px"}}>
        <thead>
          <tr key="0">
            <th scope="col">날짜</th>
            <th scope="col">이름</th>
            <th scope="col">부서</th>
            {TblItem && TblItem.map(el => (
              <th scope="col">{el}</th>
            ))}
            <th scope="col">확인여부</th>
          </tr>          
        </thead>
        <tbody>
          {CheckList && CheckList.map((el,idx) => (
            <tr key={idx+1}>
              <td>{SearchDate.full_}</td>
              <td>{el.name}</td>
              <td>{el.part}</td>
              {TblItem && TblItem.map((list,l_idx) => (
                  <td>
                    {el.item.includes(list) && 1}
                  </td>
              ))}
              <td>
              {el.confirm ? 'O' : <Button onClick={()=>{onConfrim(el)}}>확인</Button>}
              </td>
            </tr>
          ))}
          {/* <tr>
            <td>{SearchDate.full_}</td>
            <td>합계</td>
            <td>{CheckLength}</td>
            {TblItem && TblItem.map((el,idx) => (
              <td>
                {ItemSum && ItemSum[el]}
              </td>
            ))}
            <td></td>
          </tr> */}
        </tbody>
      </table>
      <table className="fl-table tbl-lunch-check" style={{marginTop:"10px"}}>
        <thead>
          <tr key="0">
            <th scope="col">날짜</th>
            <th scope="col">인원</th>
            {TblItem && TblItem.map(el => (
              <th scope="col">{el}</th>
            ))}
          </tr>          
        </thead>
        <tbody>
        <tr>
            <td>{SearchDate.full_}</td>
            <td>{CheckLength}</td>
            {TblItem && TblItem.map((el,idx) => (
              <td>
                {ItemSum && ItemSum[el]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {NonChecker &&
        <> 
          <div style={{marginTop:"15px",fontSize:"12px"}}>
          <span>없는 사람 : </span>
          {NonChecker.map((el,idx) => (
            parseInt(NonChecker.length-1) == idx ? el : el+', '
          ))}
          </div>
        </>
      }
    </>
  )
}

export default LunchAdmin
