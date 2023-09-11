import React, { useState } from "react";
import { useForm } from "react-hook-form";
import firebase from "../firebase";
import { Button, Input } from "antd";
import { ModalPopup } from "./Admin/ModifyModal";
import LogoImg from "./LogoImg";

function Login() {
  const { register, errors, handleSubmit } = useForm({
    mode: "onChange",
  });
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await firebase
        .auth()
        .signInWithEmailAndPassword(data.email, data.password);
      setLoading(false);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 5000);
    }
  };
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);

  const [InputEmail, setInputEmail] = useState(false);
  const [InputPw, setInputPw] = useState(false);
  const onInputEmail = (e) => {
    setInputEmail(e.target.value);
  };
  const onInputPw = (e) => {
    setInputPw(e.target.value);
  };

  const [PwChangeInput, setPwChangeInput] = useState("");
  const OnPwChangeInput = (e) => {
    setPwChangeInput(e.target.value);
  };
  const onPwChange = () => {
    const auth = firebase.auth();
    const emailAddress = PwChangeInput;
    console.log(emailAddress);
    auth
      .sendPasswordResetEmail(emailAddress)
      .then(function () {
        alert("이메일로 비밀번호 변경 링크를 발송했습니다.");
        onPwModal();
      })
      .catch(function (error) {
        alert("해당 이메일로 가입된 유저가 없습니다.");
      });
  };

  const [PwModal, setPwModal] = useState(false);
  const onPwModal = () => {
    setPwModal(!PwModal);
  };

  return (
    <>
      <div className="join-form-wrap">
        <div className="logo_box">
          <LogoImg />
        </div>
        <form className="join-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-box">
            <input
              name="email"
              type="email"
              id="email"
              onChange={onInputEmail}
              ref={register({ required: true, pattern: /^\S+@\S+$/i })}
            />
            <label
              htmlFor="email"
              className={"place-holder " + (InputEmail && "on")}
            >
              <span>이메일</span>
            </label>
          </div>
          <div className="input-box">
            <input
              type="password"
              onChange={onInputPw}
              name="password"
              id="password"
              ref={register({ required: true, minLength: 6 })}
            />
            <label
              htmlFor="password"
              className={"place-holder " + (InputPw && "on")}
            >
              <span>비밀번호</span>
            </label>
            {errors.password && errors.password.type === "required" && (
              <p>비밀번호를 입력해 주세요</p>
            )}
            {errors.password && errors.password.type === "minLength" && (
              <p>비밀번호는 6글자 이상이어야 합니다.</p>
            )}
            {errorFromSubmit && <p>{errorFromSubmit}</p>}
          </div>
          <input type="submit" value="로그인" disabled={loading} />
        </form>
        <div
          style={{
            position: "relative",
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          <a
            href="javascript:;"
            onClick={onPwModal}
            style={{ fontWeight: "600" }}
          >
            비밀번호를 잊어버렸을때
          </a>
          {PwModal && (
            <ModalPopup>
              <h3 style={{ fontWeight: "bold", textAlign: "center" }}>
                비밀번호 재설정
              </h3>
              <Input
                placeholder="가입했던 이메일을 입력해 주세요"
                type="text"
                value={PwChangeInput}
                onChange={OnPwChangeInput}
              />
              <div className="flex-box j-center" style={{ marginTop: "10px" }}>
                <Button
                  type="primary"
                  style={{ marginRight: "5px" }}
                  onClick={onPwChange}
                >
                  이메일로 전송
                </Button>
                <Button onClick={onPwModal}>닫기</Button>
              </div>
            </ModalPopup>
          )}
        </div>
        <div style={{ marginTop: "35px", textAlign: "center" }}>
          아직 회원이 아니시라면?<br></br>
          <a href="/join" style={{ fontWeight: "600" }}>
            회원가입 하러가기
          </a>
        </div>
      </div>
    </>
  );
}

export default Login;
