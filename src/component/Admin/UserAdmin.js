import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { Table, Button, Space, Form } from "antd";
import { OderModalPopup } from "../OrderModal";

function UserAdmin() {
  const [TotalUser, setTotalUser] = useState();
  const [ReRender, setReRender] = useState(false);

  useEffect(() => {
    let userArr = [];
    firebase
      .database()
      .ref("users")
      .once("value", (snapshot) => {
        snapshot.forEach((el) => {
          let obj = {};
          obj = el.val();
          obj.uid = el.key;
          userArr.push(obj);
        });
        setTotalUser(userArr);
      });
    return () => {};
  }, []);

  const deleteUser = (uid) => {
    const confirm = window.confirm("해당 유저를 DB에서 삭제하시겠습니까?");
    if (confirm) {
      firebase.database().ref(`users/${uid}`).remove();
      firebase.database().ref(`users/lunch/user/${uid}`).remove();
      alert("삭제되었습니다.");
      setReRender(!ReRender);
    }
  };

  const columns = [
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "부서",
      dataIndex: "part",
      key: "part",
    },
    {
      title: "uid",
      dataIndex: "uid",
      key: "uid",
    },
    {
      title: "이메일",
      dataIndex: "email",
    },
    {
      title: "전화번호",
      dataIndex: "call_number",
      key: "call_number",
    },
    {
      title: "role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "auth",
      dataIndex: "auth",
      key: "auth",
    },
    {
      title: "관리",
      align: "center",
      dataIndex: "uid",
      key: "uid",
      render: (uid) => (
        <>
          <Space>
            {/* <Button className="sm" id="btnModify" onClick={(e)=>{modifyUser(e,uid)}}>수정</Button> */}
            <Button
              className="sm"
              onClick={() => {
                deleteUser(uid);
              }}
            >
              삭제
            </Button>
          </Space>
        </>
      ),
    },
  ];

  const data = TotalUser;

  const [ModifyPop, setModifyPop] = useState(false);
  const [ModifyData, setModifyData] = useState();
  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);

  const onClosePop = () => {
    console.log(2);
  };

  const modifyUser = (e, uid) => {
    setPosX(e.clientX);
    setPosY(e.clientY);
    setModifyPop(true);
  };

  const onSubmitInfo = () => {
    console.log(1);
  };

  window.addEventListener("click", (e) => {
    if (
      e.target.id == "btnModify" ||
      e.target.parentElement.id == "btnModify"
    ) {
      setModifyPop(false);
    } else {
      e.stopPropagation();
    }
  });

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 100 }}
        rowKey={(item) => {
          return item.uid;
        }}
      />
      {ModifyPop && (
        <OderModalPopup
          className="call_modify"
          style={{
            top: `${PosY}px`,
            left: `${PosX}px`,
            transform: "translate(-110%,-50%)",
            position: "fixed",
          }}
        >
          <form className="order-form-box" onSubmit={onSubmitInfo}>
            {ModifyData && <>{ModifyData.name}</>}
            <Button>확인</Button>
          </form>
          <div className="flex-box j-center">
            <Button type="primary" onClick={onClosePop}>
              닫기
            </Button>
          </div>
        </OderModalPopup>
      )}
    </>
  );
}

export default UserAdmin;
