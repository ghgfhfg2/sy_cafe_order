import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import firebase from "../../firebase";

function AdminProdCount() {
  const [ProdItem, setProdItem] = useState();
  useEffect(() => {
    firebase
        .database()
        .ref("products")
        .on("value", snapshot => {
          let array = [];
          snapshot.forEach(function (item) {
            array.push({
              key:item.key,
              uid: item.key,
              name: item.val().name,
              count: item.val().count,
              category: item.val().category,
              jaego: item.val().jaego ? item.val().jaego :
                     item.val().jaego  === 0 ? 0 : "",
              soldout: item.val().soldout,
            });
          });
          setProdItem(array);
        });
    return () => {
    }
  }, [])

  const onProdJaego = (uid) => {
    const val = parseInt(document.querySelector(`#input_${uid}`).value);
    firebase.database().ref(`products/${uid}`)
    .update({
      jaego:val
    })
    console.log(uid)
  }
  return (
    <>
      {ProdItem &&
        <>
        <table className="fl-table" style={{maxWidth:"450px"}}>
          <thead>
            <th scope="col">상품명</th>
            <th scope="col">현재재고</th>
            <th scope="col">재고수정</th>
          </thead>
          <tbody>
          {ProdItem.map((el,idx) => (
            <tr>
              <td>{el.name}</td>
              <td>{el.jaego}</td>
              <td>
                <Input id={`input_${el.key}`} type="number" maxLength="3" style={{width:"50px"}} />
                <Button onClick={()=>{onProdJaego(el.key)}} style={{marginLeft:"5px"}}>적용하기</Button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        </>
      }
    </>
  )
}

export default AdminProdCount
