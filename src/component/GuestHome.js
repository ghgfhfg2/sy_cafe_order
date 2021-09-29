import React from 'react'
import { Carousel } from 'antd';
import Logo from "../img/logo_2021_fall.png";

function GuestHome(props) {
  const settings = {
    dots:false,
    autoplay:true,
    effect:'fade'
  };

  
  return (
    <>
      <div className="guest-home">
        <img className="top-logo-m" src={Logo} alt="" />
        <div className="slide-wrapper">
          <Carousel {...settings}>
            {props.prod.map(el=>(
              <div className="list">
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
        <div className="btn-box">
          <button onClick={props.guestPopClose} type="button" className="btn-order bg">메뉴보기</button>
        </div>
      </div>
    </>
  )
}

export default GuestHome
