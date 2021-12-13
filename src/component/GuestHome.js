import React, { useState,useRef,useEffect } from 'react'
import { Carousel,Button,Form,Input,InputNumber } from 'antd';
import * as antIcon from "react-icons/ai";
import Logo from "../img/logo_2021_winter_pc.png";
import {OderModalPopup} from "./OrderModal";
import { values } from 'lodash';
import firebase from "../firebase";

function GuestHome(props) {
  const db = firebase.database()
  const typeBox = useRef()
  const settings = {
    dots:false,
    autoplay:true,
    effect:'fade'
  };


  


  const onParkingPop = () => {
    window.open("http://suseong.iptime.org:8080/HpmsWeb")
  }

  const [VisitPop, setVisitPop] = useState(false)
  const onVistPop = () => {
    setVisitPop(true)
  }
  const onVistPopOff = () => {
    setVisitPop(false)
  }


  return (
    <>
      <div className="guest-home">
      <img className="top-logo-m" src={Logo} alt="" />
        <div className="slide-wrapper">
          <Carousel {...settings}>
            {props.prod.map((el,idx)=>(
              <div key={idx} className="list">
                <div className="img-box">
                  <img src={el.image} />
                </div>  
                <div className="tit">
                  <span className="name">{el.name}</span>
                  <span className="hot">{
                    el.hot !== 'etc' && el.hot
                  }
                  </span>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <div className="home-menu">
          <Button className="menu" onClick={props.guestPopClose}>
              <antIcon.AiOutlineCoffee className="ic" />
              메뉴화면
          </Button>
          <Button className="menu" onClick={onParkingPop}>
              <antIcon.AiOutlineCar className="ic" />
              주차등록
          </Button>
        </div>
      </div>
      
    </>
  )
}

export default GuestHome
