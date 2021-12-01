import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Nav from "./component/Nav";
import './custom_antd.less';
import "./App.css";
import Join from "./component/Join";
import Login from "./component/Login";
import Menu from "./component/Menu";
import MyOrder from "./component/MyOrder";
import MyMenu from "./component/MyMenu";
import AdminProd from "./component/Admin/AdminProd";
import AdminOrder from "./component/Admin/AdminOrder";
import AdminOrderList from "./component/Admin/AdminOrderList";
import LunchAdmin from "./component/Admin/LunchAdmin";
import Research from "./component/Research/Research";
import ResearchWrite from "./component/Research/ResearchWrite";
import ResearchView from "./component/Research/ResearchView";
import Loading from "./component/Loading";
import LunchCheck from "./component/LunchCheck";
import { Layout, Button, BackTop } from "antd";
import firebase from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user_action";
import { getNotificationPermission } from "./component/CommonFunc";
import * as antIcon from "react-icons/ai";
//import Logo from "./img/logo.svg";
//import Logo from "./img/logo_2021_spring.png";
//import Logo_PC from "./img/logo_2021_summer_pc.png";
//import Logo from "./img/logo_2021_summer.png";
//import Logo_PC from "./img/logo_2021_fall_pc.png";
import Logo_PC from "./img/logo_2021_winter_pc.png";
import Logo from "./img/logo_2021_fall.png";
import Test from "./component/Test";
import UserAdmin from "./component/Admin/UserAdmin";
import Hair from "./component/hair/Hair";
import HairAdmin from "./component/Admin/HairAdmin";
import AdminProdCount from "./component/Admin/AdminProdCount";
import ResearchModify from "./component/Research/ResearchModify";
import ResearchTemp from "./component/Research/ResearchTemp";
import Chair from "./component/welfare/Chair";
import ChairAdmin from "./component/welfare/ChairAdmin";
import StylerAdmin from "./component/welfare/StylerAdmin";
import Styler from "./component/welfare/Styler";
import Inventory from "./component/inven/Inventory";
import InvenAdmin from "./component/Admin/InvenAdmin";

const { Sider, Content, Header } = Layout;

function App(props) {
  function isDesktopOS(){
    return ( 'win16|win32|win64|windows|mac|macintel|linux|freebsd|openbsd|sunos'.indexOf(navigator.platform.toLowerCase()) >= 0 ); 
  }

  if(isDesktopOS()){
    getNotificationPermission();
  }

  let history = useHistory();
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase
        .database()
        .ref("users")
        .child(user.uid)
        .once("value", (snapshot) => {
          let addInfo = {
            ...user,
            auth:snapshot.val().auth ? snapshot.val().auth : "",
            call_number:snapshot.val().call_number,
            favorite:snapshot.val().favorite,
            role:snapshot.val().role,
            sosok:snapshot.val().sosok,
          }
          
          history.push("/");
          dispatch(setUser(addInfo));
        });
      } else {
        history.push("/login");
        dispatch(clearUser());
      }
    });
  }, []);
  

  // 스크롤 이벤트 핸들러
  const [TopFix, setTopFix] = useState(false);
  const [TopFixLeft, setTopFixLeft] = useState(false);
  const handleScroll = () => {
    let scrollTop = document.documentElement.scrollTop;
    if (scrollTop >= 130) {
      setTopFixLeft(true);
    } else {
      setTopFixLeft(false);
    }
    if (scrollTop >= 80) {
      setTopFix(true);
    } else {
      setTopFix(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
  if (isLoading) {
    return (
      <>
        <Layout className={TopFix && "top-fix"}>
          <Header className="header-box">
            <a href="/">
              <img className="top-logo" src={Logo_PC} alt="" />
              <img className="top-logo-m" src={Logo_PC} alt="" />
            </a>
          </Header>
          <Layout>
            <div className="content-box">
              <Sider className={"nav-wrap " + (TopFixLeft && "fix")}>
                <Nav />
              </Sider>
              <Content>
                <Loading />
              </Content>
            </div>
          </Layout>
        </Layout>
      </>
    );
  } else {
    return (
      <>
        <Layout className={TopFix && "top-fix"}>
          <Header className="header-box">
            <a href="/">
              <img className="top-logo" src={Logo_PC} alt="" />
              <img className="top-logo-m" src={Logo} alt="" />
            </a>
          </Header>
          <Layout>
            <div className="content-box">
              <Sider className={"nav-wrap " + (TopFixLeft && "fix")}>
                <Nav />
              </Sider>
              <Content>
                <Switch>
                  <Route exact path="/" component={Menu} />
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/join" component={Join} />
                  <Route exact path="/myorder" component={MyOrder} />
                  <Route exact path="/mymenu" component={MyMenu} />
                  <Route exact path="/lunch" component={LunchCheck} />
                  <Route exact path="/admin/prod" component={AdminProd} />
                  <Route exact path="/admin/prod_count" component={AdminProdCount} />
                  <Route exact path="/admin/order" component={AdminOrder} />
                  <Route exact path="/admin/lunch" component={LunchAdmin} />
                  <Route exact path="/admin/order_list" component={AdminOrderList}/>
                  <Route exact path="/research" component={Research} />
                  <Route exact path="/research_write" component={ResearchWrite} />
                  <Route exact path="/research_modify" component={ResearchModify} />
                  <Route exact path="/research_temp" component={ResearchTemp} />
                  <Route exact path="/research_view" component={ResearchView} />
                  <Route exact path="/hair" component={Hair} />
                  <Route exact path="/admin/user_admin" component={UserAdmin} />
                  <Route exact path="/admin/hair" component={HairAdmin} />
                  <Route exact path="/chair" component={Chair} />
                  <Route exact path="/chair_admin" component={ChairAdmin} />
                  <Route exact path="/styler" component={Styler} />
                  <Route exact path="/styler_admin" component={StylerAdmin} />
                  <Route exact path="/inventory" component={Inventory} />
                  <Route exact path="/admin/inventory" component={InvenAdmin} />
                  <Route exact path="/test" component={Test} />
                </Switch>
              </Content>
              <BackTop>
                <Button
                  type="primary"
                  shape="circle"
                  className="btn-top-move"
                  icon={<antIcon.AiOutlineArrowUp />}
                />
              </BackTop>
            </div>
          </Layout>
        </Layout>
      </>
    );
  }
}

export default App;
