import React, { useState } from "react";
import styled from "styled-components";

export const FileLabel = styled.label`
  display: flex;
  width: 60px;
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 5px;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  overflow: hidden;
  img {
    width: 100%;
    height: auto;
  }
`;

function ImgUpload({ onImgFile }) {
  const [ProdImg, setProdImg] = useState();
  const handleChange = (e) => {
    onImgFile(e);
    let reader = new FileReader();
    reader.onload = function (event) {
      setProdImg(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);
    setProdImg(e.target.files[0]);
  };

  return (
    <>
      <input
        style={{ display: "none" }}
        type="file"
        id="imgFile1"
        onChange={handleChange}
      />
      <FileLabel htmlFor="imgFile1" style={{ marginRight: "5px" }}>
        {ProdImg && <img src={`${ProdImg}`} alt="" />}
        {!ProdImg && `이미지`}
      </FileLabel>
    </>
  );
}

export default ImgUpload;
