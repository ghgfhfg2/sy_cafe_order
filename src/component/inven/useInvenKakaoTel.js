import { useEffect, useState } from "react";
import firebase from "../../firebase";

const useInvenKakaoTel = () => {
  const db = firebase.database();
  const [alertTelArr, setAlertTelArr] = useState(undefined);
  const [alertTelTxt, setAlertTelTxt] = useState(undefined);

  useEffect(() => {
    db.ref("inventory/alert_tel").on("value", (data) => {
      if (!data.val()) return;
      setAlertTelArr(data.val());
      setAlertTelTxt(data.val().join());
    });
    return () => {
      db.ref("inventory/alert_tel").off();
    };
  }, []);

  return { alertTelArr, alertTelTxt };
};

export default useInvenKakaoTel;
