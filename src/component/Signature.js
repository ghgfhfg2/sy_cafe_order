import React, { useState, useEffect } from "react";
import SignaturePad from "signature_pad";
import {Button} from "antd";
import * as antIcon from "react-icons/ai";

let sigPad = null;
function Signature({onSigpad}) {
  let w,h;
  if(window.outerWidth < 760){
    w = window.outerWidth-50;
  }else{
    w = 350;
    h = 150;
  }
  useEffect(() => {
    let canvas  = document.getElementById("signature-pad");
    sigPad = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      onEnd: () => {
        onSigpad(sigPad.toDataURL("image/svg+xml")); 
      }
    });
    
    return () => {};
  }, []);  
  const handleRestSignature = () => {
    sigPad.clear();
    onSigpad();
  };


  return (
    <>
      <div className="signature-box">
        <canvas
          id="signature-pad"
          className="signature-pad"
          width={w}
          height={h}
        />
        <Button className="clear" onClick={handleRestSignature}>
          <antIcon.AiOutlineDelete />
          clear
        </Button>
      </div>
    </>
  )
}

export default Signature
