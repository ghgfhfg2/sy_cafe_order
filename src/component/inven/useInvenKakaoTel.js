import { useEffect, useState } from "react";
import firebase, {wel} from "../../firebase";

const useInvenKakaoTel = () => {
  const db = firebase.database(wel);  
  const [alertTelArr, setAlertTelArr] = useState(undefined);
  const [alertTelTxt, setAlertTelTxt] = useState(undefined);

  useEffect(() => {    
    db.ref('inventory/alert_tel')
    .on('value',data=>{
      setAlertTelArr(data.val());
      setAlertTelTxt(data.val().join());
    })    
    return () => {
      db.ref('inventory/alert_tel').off();
    }
  }, [])

  return {alertTelArr,alertTelTxt}
}

export default useInvenKakaoTel;