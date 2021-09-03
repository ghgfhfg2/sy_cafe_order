import React, { useState, useEffect } from "react";
import SignaturePad from "signature_pad";

function Test() {
  useEffect(() => {
    var canvas = document.getElementById("signature-pad");
    var signaturePad = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)" // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
    });

    return () => {};
  }, []);  
  return (
    <>
      <canvas
        id="signature-pad"
        className="signature-pad"
        width={400}
        height={200}
      />
    </>
  )
}

export default Test
