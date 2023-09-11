import { useEffect, useState } from "react";
import logo from "../img/logo.png";
import styled from "styled-components";
const ImgBox = styled.img`
  max-width: 150px;
`;

export default function LogoImg() {
  return <ImgBox className="top-logo" src={logo} alt="" />;
}
