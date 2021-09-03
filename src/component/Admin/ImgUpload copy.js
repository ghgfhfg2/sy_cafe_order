import React, {useState} from 'react'
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';


function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('jpg/png 파일만 업로드 할 수 있습니다.');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('이미지 용량은 1메가 이하로 올려주세요');
    }
    return isJpgOrPng && isLt1M;
  }  

function ImgUpload({onImgFile}) {
    const [Loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState()
    
    const uploadButton = (
      <div>
        {Loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );    
    const handleChange = info => {
        onImgFile(info);
        if (info.file.status === 'uploading') {
            setLoading( true );
          return;
        }
        if (info.file.status === 'done') {
          getBase64(info.file.originFileObj, imageUrl => {
            setLoading(false)
            setImageUrl(imageUrl)
            }
          );
        }
      };
    

    return (
        <>
            <Upload
                name="prodImg"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                beforeUpload={beforeUpload}
                onChange={handleChange}
            >
                {imageUrl ? <img src={imageUrl} alt="prodImg" style={{ width: '100%' }} /> : uploadButton}
            </Upload>            
        </>
    )
}

export default ImgUpload
