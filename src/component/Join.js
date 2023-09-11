import { message } from "antd";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import firebase from "../firebase";
import uuid from "react-uuid";

function Join() {
  const { register, handleSubmit, watch, errors } = useForm({
    mode: "onChange",
  });
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);

  const password = useRef();
  password.current = watch("password");
  const onSubmit = async (data) => {
    console.log(11);
    data.storeCode = uuid();
    console.log(data);
    //data.part == 1 && alert("부서를 선택해 주세요");
    try {
      setLoading(true);
      let createdUser = await firebase
        .auth()
        .createUserWithEmailAndPassword(data.email, data.password);

      await createdUser.user.updateProfile({
        displayName: data.name,
        photoURL: data.part,
      });

      //Firebase 데이터베이스에 저장해주기
      await firebase
        .database()
        .ref("users")
        .child(createdUser.user.uid)
        .set({
          ...data,
          name: createdUser.user.displayName,
          part: createdUser.user.photoURL || "",
          email: data.email,
          role: 0,
          auth: "intern",
        });
      setLoading(false);

      window.location.reload();
    } catch (error) {
      console.log(error);
      setErrorFromSubmit(error.message);

      setLoading(false);
    }
  };

  watch("name");
  watch("email");
  //watch("call_number");
  watch("password");
  watch("password2");

  const [InputName, setInputName] = useState(false);
  const [InputNick, setInputNick] = useState(false);
  const [InputEmail, setInputEmail] = useState(false);
  const [InputPhone, setInputPhone] = useState(false);
  const [InputPw, setInputPw] = useState(false);
  const [InputPw2, setInputPw2] = useState(false);
  const [InputStoreName, setInputStoreName] = useState(false);

  const onInputName = (e) => {
    setInputName(e.target.value);
  };
  const onInputNick = (e) => {
    setInputNick(e.target.value);
  };
  const onInputEmail = (e) => {
    setInputEmail(e.target.value);
  };
  const onInputPhone = (e) => {
    setInputPhone(e.target.value);
  };
  const onInputPw = (e) => {
    setInputPw(e.target.value);
  };
  const onInputPw2 = (e) => {
    setInputPw2(e.target.value);
  };

  const onInputStoreName = (e) => {
    setInputStoreName(e.target.value);
  };

  //사용자,관리자 구분
  const [userJoin, setUserJoin] = useState(1);
  const onChangeSosok = (e) => {
    console.log(e.target.value);
    if (e.target.value == 1) {
      setUserJoin(1);
    } else {
      setUserJoin(2);
    }
  };

  return (
    <>
      <div className="join-form-wrap">
        <form className="join-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-box">
            <input
              type="text"
              onChange={onInputName}
              name="name"
              id="name"
              ref={register({ required: true })}
            />
            <label
              htmlFor="name"
              className={"place-holder " + (InputName && "on")}
            >
              <span>이름</span>
            </label>
            {errors.name && errors.name.type === "required" && (
              <p>이름을 입력해 주세요</p>
            )}
          </div>
          <div className="input-box">
            <input
              type="text"
              onChange={onInputNick}
              name="nick"
              id="nick"
              ref={register({ required: true })}
            />
            <label
              htmlFor="nick"
              className={"place-holder " + (InputNick && "on")}
            >
              <span>닉네임</span>
            </label>
            {errors.nick && errors.nick.type === "required" && (
              <p>닉네임을 입력해 주세요</p>
            )}
          </div>
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
            <span
              style={{
                color: "#888",
                fontSize: "12px",
                display: "block",
                paddingLeft: "10px",
                marginTop: "3px",
              }}
            >
              ※ 사용 가능한 이메일로 가입 바랍니다(비밀번호 재설정 시 필요해요)
            </span>
            {errors.email && errors.email.type === "required" && (
              <p>이메일을 입력해 주세요</p>
            )}
            {errors.email && errors.email.type === "pattern" && (
              <p>이메일 형식이 맞지 않습니다.</p>
            )}
          </div>

          <div className="input-box">
            <input
              type="password"
              name="password"
              id="password"
              onChange={onInputPw}
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
              <p>비밀번호는 최소 6글자이상 이어야 합니다.</p>
            )}
          </div>
          <div className="input-box">
            <input
              type="password"
              name="password2"
              id="password2"
              onChange={onInputPw2}
              ref={register({
                required: true,
                validate: (value) => value === password.current,
              })}
            />
            <label
              htmlFor="password2"
              className={"place-holder " + (InputPw2 && "on")}
            >
              <span>비밀번호 확인</span>
            </label>
            {errors.password2 && errors.password2.type === "required" && (
              <p>비밀번호 확인을 입력해 주세요</p>
            )}
            {errors.password2 && errors.password2.type === "validate" && (
              <p>비밀번호가 일치하지 않습니다.</p>
            )}
            {errorFromSubmit && <p>{errorFromSubmit}</p>}
          </div>
          <div className="input-box radio">
            <div className="flex-box">
              <input
                type="radio"
                className="custom-radio"
                name="sosok"
                id="sosok1"
                value="1"
                defaultChecked
                onClick={onChangeSosok}
                ref={register({ required: true })}
              />
              <label for="sosok1">사용자</label>
              <input
                type="radio"
                className="custom-radio"
                name="sosok"
                id="sosok2"
                value="2"
                onClick={onChangeSosok}
                ref={register({ required: true })}
              />
              <label for="sosok2">관리자</label>
            </div>
            {userJoin == 2 && (
              <>
                <div className="input-box" style={{ marginTop: "30px" }}>
                  <input
                    type="text"
                    onChange={onInputStoreName}
                    name="storeName"
                    id="storeName"
                    ref={register({ required: true })}
                  />
                  <label
                    htmlFor="storeName"
                    className={"place-holder " + (InputStoreName && "on")}
                  >
                    <span>스토어이름</span>
                  </label>
                  {errors.storeName && errors.storeName.type === "required" && (
                    <p>스토어이름을 입력해 주세요</p>
                  )}
                </div>
              </>
            )}
            {errors.sosok && <p>소속을 선택해 주세요</p>}
          </div>
          <input type="submit" value="회원가입" disabled={loading} />
        </form>
      </div>
    </>
  );
}

export default Join;
