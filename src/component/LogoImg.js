import { useEffect, useState } from "react"
import Logo from "../img/logo.svg";
import LogoSpring from "../img/logo_2021_spring.png";
import LogoSummer from "../img/logo_2021_summer.png";
import LogoFall from "../img/logo_2021_fall.png";
import LogoWinter from "../img/logo_2021_winter_pc.png";

export default function LogoImg() {
  let curMonth = new Date().getMonth()+1
  const [logo, setLogo] = useState()
  useEffect(() => {
    let src;
    if(curMonth >= 12 || curMonth <= 2) {src = 1}
    if(curMonth >= 3 && curMonth <= 5) {src = 2}
    if(curMonth >= 6 && curMonth <= 8) {src = 3}
    if(curMonth >= 9 && curMonth <= 11) {src = 4}
    setLogo(src);
  }, [curMonth])
  
  return (
    <>
    <img className="top-logo" src={
      logo === 1 ? LogoWinter :
      logo === 2 ? LogoSpring :
      logo === 3 ? LogoSummer :
      logo === 4 ? LogoFall : ''
    } alt="" />
    <img className="top-logo-m" src={
      logo === 1 ? LogoWinter :
      logo === 2 ? LogoSpring :
      logo === 3 ? LogoSummer :
      logo === 4 ? LogoFall : ''
    } alt="" />
    </>
  )
}
