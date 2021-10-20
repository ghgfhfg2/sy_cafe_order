import React, { useState, useEffect } from "react";
import SignaturePad from "signature_pad";
import {Button} from "antd";
import * as antIcon from "react-icons/ai";

let sigPad = null;
function Signature({onSigpad}) {

  useEffect(() => {
    let canvas  = document.getElementById("signature-pad");
    sigPad = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      onEnd: () => {
        onSigpad(sigPad.toDataURL("image/svg+xml")); 
      }
    });

    function resizeCanvas() {
      let ratio =  Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      sigPad.clear();
  }
  
  window.onresize = resizeCanvas;
  resizeCanvas();

    
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
