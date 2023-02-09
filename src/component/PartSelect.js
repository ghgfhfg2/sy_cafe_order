import { useEffect, useState, useRef } from "react";
import firebase from "../firebase";

export default function PartSelect({ userPart }) {
  const [partSelect, setPartSelect] = useState();
  const partRef = useRef();
  useEffect(() => {
    firebase
      .database()
      .ref(`part_setting`)
      .on("value", (snapshot) => {
        setPartSelect(snapshot.val());
      });
    return () => {
      firebase.database().ref("part_setting").off();
    };
  }, []);
  useEffect(() => {
    partRef.current.value = userPart;
  }, [partSelect]);

  return (
    <>
      <select name="part" ref={partRef} defaultValue={"총괄"}>
        <option value="photoUrl" disabled hidden>
          부서
        </option>
        {partSelect &&
          partSelect.map((el, idx) => (
            <option key={idx} value={el}>
              {el}
            </option>
          ))}
      </select>
    </>
  );
}
