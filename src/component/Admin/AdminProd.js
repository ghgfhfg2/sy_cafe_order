import React, { useState, useEffect } from "react";
import ImgUpload from "./ImgUpload";
import {
  Form,
  Button,
  Input,
  Radio,
  Checkbox,
  Row,
  Divider,
  Switch,
  TimePicker,InputNumber
} from "antd";
import firebase from "../../firebase";
import styled from "styled-components";
import ModifyModal from "./ModifyModal";
import uuid from "react-uuid";

export const ProdList = styled.div`
  display: flex;
  flex-wrap: wrap;
  .list {
    animation-delay: 1s;
    margin: 12px 8px;
    width: calc(20% - 16px);
    display: flex;
    flex-direction: column;
    border-radius: 7px;    
    border:1px solid #e1e1e1;
    overflow: hidden;
    transition: all 0.2s;
    &:hover {
      img{
        transform: translate(-50%, -50%) scale(1.07);
      }
      box-shadow: 0px 0px 4px 1px rgba(0, 0, 0, 0.25);
    }
    .img {
      height: 0;
      border-top-left-radius: 7px;
      border-top-right-radius: 7px;
      overflow: hidden;
      width: 100%;
      padding-bottom: 100%;
      overflow: hidden;
      position: relative;
    }
    img {
      height: 100%;
      position: absolute;
      left: 50%;
      top: 50%;
      transition:all 0.2s;
      transform: translate(-50%, -50%);
    }
    .kal {
      position: absolute;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.85);
      display: inline-block;
      z-index: 1;
      padding: 3px 6px;
      font-size: 12px;
      border-top-left-radius: 5px;
    }
  }
  .txt {
    display: flex;
    flex: 1;
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 4px;
    .name {
      font-weight: bold;
      font-size: 14px;
      margin: 3px 0 2px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2; 
      -webkit-box-orient: vertical;
      overflow:hidden;
      max-height: 46px;
    }
    .ic-favor {
      margin-top: 5px;
      margin-left: 5px;
      flex-shrink: 0;
      z-index: 10;
      width: 18px;
      height: 18px;
      opacity: 0.3;
      transition: all 0.2s;
      &:hover{opacity:1}
      svg {
        width: 100%;
        height: 100%;
        display: none;
      }
      .no-favor {
        display: block;        
      }
      .favor {
        display: none;
      }
      &.true {
        opacity: 1;

        .no-favor {
          display: none;
        }
        .favor {
          display: block;
        }
      }
    }
    .hot {
      font-size: 13px;
    }
    .price {
      font-size: 13px;
      color: #1672c9;
    }
  }
  .user-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    padding: 7px 5px;
  }
  .admin {
    display: flex;
    button {
      margin: 2px;
    }
  }
  .admin-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    padding: 7px;
  }
  @media all and (max-width: 1400px) {
    .list {
      width: calc(20% - 16px);
    }
  }
  @media all and (max-width: 1024px) {
    .list {
      width: calc(33.33% - 16px);
    }
  }
  @media all and (max-width: 500px) {
    .list {
      width: calc(50% - 16px);
    }
  }
`;

function AdminProd() {
  const [ItemChange, setItemChange] = useState(0);
  const [ProdItem, setProdItem] = useState([]);

  //정렬 라디오버튼
  const [CateRadio, setCateRadio] = useState("all");
  const itemSort = (e) => {
    setCateRadio(e.target.value);
  };

  const [Soldout, setSoldout] = useState();
  const SoldoutToggle = () => {
    setSoldout(!Soldout);
    firebase
      .database()
      .ref("soldout")
      .child("b_soldout")
      .transaction((pre) => {
        return !pre;
      });
  };

  const [MilkSoldout, setMilkSoldout] = useState();
  const MilkSoldoutToggle = () => {
    setMilkSoldout(!MilkSoldout);
    firebase
      .database()
      .ref("soldout")
      .child("MilkSoldout")
      .transaction((pre) => {
        return !pre;
      });
  };
  const [MilkSoldout2, setMilkSoldout2] = useState();
  const MilkSoldoutToggle2 = () => {
    setMilkSoldout2(!MilkSoldout2);
    firebase
      .database()
      .ref("soldout")
      .child("MilkSoldout2")
      .transaction((pre) => {
        return !pre;
      });
  };  

  const [AbleTime, setAbleTime] = useState()
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
      .database()
      .ref("time")
      .on("value", (snapshot) => {
        setAbleTime(snapshot.val());
      });      
    }
    return () => {
      mounted = false;
    }
  }, [])  

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
        .database()
        .ref("soldout")
        .once("value")
        .then((snapshot) => {    
          let soldoutArr = [];      
            soldoutArr.push({
              b_soldout:snapshot.val().b_soldout,
              MilkSoldout:snapshot.val().MilkSoldout,
              MilkSoldout2:snapshot.val().MilkSoldout2
            })
            setSoldout(snapshot.val().b_soldout);            
            setMilkSoldout(snapshot.val().MilkSoldout);            
            setMilkSoldout2(snapshot.val().MilkSoldout2);            
        });        
      firebase
        .database()
        .ref("products")
        .once("value")
        .then((snapshot) => {
          let array = [];
          snapshot.forEach(function (item) {
            array.push({
              uid: item.key,
              name: item.val().name,
              kal: item.val().kal,
              hot: item.val().hot,
              limit: item.val().limit,
              category: item.val().category,
              image: item.val().image,
              price: item.val().price,
              soldout: true,
            });
          });
          array = array.filter((el) => {
            if (CateRadio === "all") {
              return el;
            }
            return el.category === CateRadio;
          });
          setProdItem(array);
        });
    }
    return function cleanup() {
      mounted = false;
    };
  }, [ItemChange, CateRadio]);

  const [ImgFile, setImgFile] = useState();
  const onImgFile = (e) => {
    setImgFile(e.target.files[0]);
  };

  // submit
  const onSubmitProd = async (values) => {
    
    if (isNaN(values.price)) {
      alert("가격은 숫자만 입력해 주세요");
      return;
    }
    if (!ImgFile) {
      alert("이미지를 올려주세요");
      return;
    }
    const file = ImgFile;
    const metadata = ImgFile.type;
    try {
      let uploadTaskSnapshot = await firebase
        .storage()
        .ref("products")
        .child(`prod_image/${uuid()}`)
        .put(file, metadata);
      let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();
      if (!values.add) {
        values.add = "";
      }
      if (!values.milk) {
        values.milk = "";
      }
      if (!values.limit) {
        values.limit = false;
      }
      if (!values.option) {
        values.option = "";
      }
      values.sort_num = parseInt(values.sort_num);
      values.sort_num >= 0 ? values.sort_num = values.sort_num : values.sort_num = 9999;
      await firebase
        .database()
        .ref("products")
        .child(uuid())
        .set({
          ...values,
          image: downloadURL,
        });
      setItemChange((pre) => pre + 1);
      alert("상품을 등록했습니다.");
    } catch (error) {
      alert(error);
    }
  };

  // 모달팝업 호출
  const [Puid, setPuid] = useState();
  const [Pimg, setPimg] = useState();
  const [OnModal, setOnModal] = useState(false);
  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);
  const onProdModify = (e, uid, img) => {
    setPosX(e.clientX);
    setPosY(e.clientY);
    setPuid(uid);
    setPimg(img);
    setOnModal(true);
  };

  const onProdDelete = async (uid) => {
    const delConfirm = window.confirm("삭제하시겠습니까?");
    try {
      if (delConfirm) {
        await firebase.database().ref("products").child(uid).remove();
        setItemChange((pre) => pre + 1);
        alert("상품을 삭제했습니다.");
      }
    } catch (error) {
      alert(error);
    }
  };

  const onFinished = () => {
    setOnModal(false);
    setItemChange((pre) => pre + 1);
  };

  const [ProdRegist, setProdRegist] = useState(false);
  const ProdRegistToggle = () => {
    setProdRegist(!ProdRegist);
  };
  const [TimeRegist, setTimeRegist] = useState(false);
  const TimeRegistToggle = () => {
    setTimeRegist(!TimeRegist);
  };  

  const format = 'HH:mm';
  const onTimeSet = () => {
    let time1_1 = document.querySelectorAll('.time1 input')[0].value;
    let time1_2 = document.querySelectorAll('.time1 input')[1].value;
    let time2_1 = document.querySelectorAll('.time2 input')[0].value;
    let time2_2 = document.querySelectorAll('.time2 input')[1].value;
    let time3_1 = document.querySelectorAll('.time3 input')[0].value;
    let time3_2 = document.querySelectorAll('.time3 input')[1].value;
    let time4_1 = document.querySelectorAll('.time4 input')[0].value;
    let time4_2 = document.querySelectorAll('.time4 input')[1].value;
    let body = {}
    body.ableTimeStart = time1_1;
    body.ableTimeEnd = time1_2;
    body.disableTimeStart = time2_1;
    body.disableTimeEnd = time2_2;
    body.lunchTimeStart = time3_1;
    body.lunchTimeEnd = time3_2;
    body.breakTimeStart = time4_1;
    body.breakTimeEnd = time4_2;
    
    firebase.database().ref('time').update(body)

  }

  return (
    <>
      <div className="flex-box a-center" style={{ marginBottom: "10px" }}>
        <h3 className="title" style={{ margin: "0 10px 0 0" }}>
        운영시간 설정
        </h3>
        <Switch
          onChange={TimeRegistToggle}
          checkedChildren="on"
          unCheckedChildren="off"
        />
      </div> 
      {AbleTime && TimeRegist && (
      <div style={{marginBottom:"20px"}}>
        <div className="time-seting">
          <div className="tit">
            운영시간
          </div>
          <TimePicker.RangePicker className="time1" format={format} />
          <div className="tit">
            주문불가 시간
          </div>
          <TimePicker.RangePicker className="time2" format={format} />     
        </div>
        <div className="time-seting">
          <div className="tit">
            점심시간
          </div>
          <TimePicker.RangePicker className="time3" format={format} />
          <div className="tit">
            브레이크 타임
          </div>
          <TimePicker.RangePicker className="time4" format={format} />        
        </div>
        <Button
              htmlType="button"
              style={{ width: "100%",maxWidth:"250px" }}
              type="primary"
              size="large"
              onClick={onTimeSet}
            >
              시간설정 적용하기
            </Button>
      </div>
      )}
      <div className="flex-box a-center" style={{ marginBottom: "10px" }}>
        <h3 className="title" style={{ margin: "0 10px 0 0" }}>
          상품등록
        </h3>
        <Switch
          onChange={ProdRegistToggle}
          checkedChildren="on"
          unCheckedChildren="off"
        />
      </div>            
      {ProdRegist && (
        <Form className="admin-prod-form" onFinish={onSubmitProd}>
          <div
            className="ant-row ant-form-item ant-form-item-has-success"
            style={{ alignItems: "center" }}
          >
            <div className="ant-col ant-form-item-label">
              <label htmlFor="category" className="ant-form-item-required">
                이미지
              </label>
            </div>
            <ImgUpload onImgFile={onImgFile} />
          </div>
          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: "카테고리를 선택해 주세요" }]}
          >
            <Radio.Group>
              <Radio.Button value="커피">커피</Radio.Button>
              <Radio.Button value="라떼">라떼</Radio.Button>
              <Radio.Button value="에이드">에이드</Radio.Button>
              <Radio.Button value="차">차</Radio.Button>
              <Radio.Button value="프로틴">프로틴</Radio.Button>
              <Radio.Button value="스낵">스낵</Radio.Button>
              <Radio.Button value="주스">주스</Radio.Button>
            </Radio.Group>
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
            <Input />
          </Form.Item>
          <Form.Item
            name="option"
            label="옵션"    
          >
            <Input placeholder="옵션명을 ,(콤마)로 구분해서 적어주세요" />
          </Form.Item>
          <Form.Item
            name="hot"
            label="온도"
            rules={[{ required: true, message: "온도를 선택해 주세요" }]}
          >
            <Radio.Group>
              <Radio.Button value="hot & ice">hot & ice</Radio.Button>
              <Radio.Button value="hot only">hot only</Radio.Button>
              <Radio.Button value="ice only">ice only</Radio.Button>
              <Radio.Button value="etc">etc</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="kal"
            label="칼로리"
            rules={[
              {
                required: true,
                message: "칼로리를 입력해 주세요",
              },
            ]}
          >
            <Input className="sm-input" />
          </Form.Item>
          <Form.Item
            name="price"
            label="가격"
            rules={[
              {
                required: true,
                message: "가격을 입력해 주세요",
              },
            ]}
          >
            <Input className="sm-input" type="text" />
          </Form.Item>

          <Form.Item name="add" label="추가">
            <Checkbox.Group>
              <Row>
                <Checkbox value="버블" style={{ lineHeight: "32px" }}>
                  버블
                </Checkbox>
                <Checkbox value="샷" style={{ lineHeight: "32px" }}>
                  샷
                </Checkbox>
                <Checkbox value="연하게" style={{ lineHeight: "32px" }}>
                  연하게
                </Checkbox>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name="milk" label="우유 유무">
            <Checkbox.Group>
              <Row>
                <Checkbox value="1" style={{ lineHeight: "32px" }}>
                  우유
                </Checkbox>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="1개제한" name="limit" valuePropName="checked"> 
              <Checkbox style={{ lineHeight: "32px" }} />                  
          </Form.Item>
          <Form.Item name="sort_num" label="순서">
            <Input className="sm-input" type="number" />
          </Form.Item>

          <div className="ant-row ant-form-item soldout-switch">
            <div className="ant-col ant-form-item-label">
              <label htmlFor="price">버블품절</label>
            </div>
            <div className="ant-col ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  {Soldout === true && (
                    <>
                      <Switch
                        onChange={SoldoutToggle}
                        checkedChildren="판매"
                        unCheckedChildren="품절"
                        defaultChecked
                      />
                    </>
                  )}
                  {Soldout === false && (
                    <>
                      <Switch
                        onChange={SoldoutToggle}
                        checkedChildren="판매"
                        unCheckedChildren="품절"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="ant-col ant-form-item-label">
              <label htmlFor="price">무지방 품절</label>
            </div>
            <div className="ant-col ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  {MilkSoldout === true && (
                    <>
                      <Switch
                        onChange={MilkSoldoutToggle}
                        checkedChildren="판매"
                        unCheckedChildren="품절"
                        defaultChecked
                      />
                    </>
                  )}
                  {MilkSoldout === false && (
                    <>
                      <Switch
                        onChange={MilkSoldoutToggle}
                        checkedChildren="판매"
                        unCheckedChildren="품절"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="ant-col ant-form-item-label">
              <label htmlFor="price">락토프리 품절</label>
            </div>
            <div className="ant-col ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  {MilkSoldout2 === true && (
                    <>
                      <Switch
                        onChange={MilkSoldoutToggle2}
                        checkedChildren="판매"
                        unCheckedChildren="품절"
                        defaultChecked
                      />
                    </>
                  )}
                  {MilkSoldout2 === false && (
                    <>
                      <Switch
                        onChange={MilkSoldoutToggle2}
                        checkedChildren="판매"
                        unCheckedChildren="품절"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

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
      <h3 className="title">상품리스트</h3>
      <div className="menuCategory">
        <Radio.Group
          className="menuCategory"
          onChange={itemSort}
          defaultValue="all"
          buttonStyle="solid"
        >
          <Radio.Button value="all">전체</Radio.Button>
          <Radio.Button value="커피">커피</Radio.Button>
          <Radio.Button value="라떼">라떼</Radio.Button>
          <Radio.Button value="에이드">에이드</Radio.Button>
          <Radio.Button value="차">차</Radio.Button>
          <Radio.Button value="프로틴">프로틴</Radio.Button>
          <Radio.Button value="스낵">스낵</Radio.Button>
          <Radio.Button value="주스">주스</Radio.Button>
        </Radio.Group>
      </div>
      <ProdList>
        {ProdItem.map((item, index) => (
          <div className="list" key={index}>
            <div className="img">
              <span className="kal">{item.kal}kal</span>
              <img src={item.image} alt="" />
            </div>
            <div className="admin-box">
              <div className="txt">
                <span className="name">{item.name}
                  <span className="hidden">{item.uid}</span>
                </span>
                <div className="flex-box between">
                  <span className="hot">{item.hot}</span>
                  <span className="price">{item.price}원</span>
                </div>
              </div>
              <div className="admin">
                <Button onClick={(e) => onProdModify(e, item.uid, item.image)}>
                  수정
                </Button>
                <Button onClick={() => onProdDelete(item.uid)}>삭제</Button>
              </div>
            </div>
          </div>
        ))}
      </ProdList>
      {OnModal && (
        <ModifyModal
          puid={Puid}
          pimg={Pimg}
          onFinished={onFinished}
          posx={PosX}
          posy={PosY}
        />
      )}
    </>
  );
}

export default AdminProd;
