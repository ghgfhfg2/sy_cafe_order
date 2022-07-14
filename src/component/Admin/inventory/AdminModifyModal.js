import { Button, Form, Input, InputNumber, Radio } from 'antd';
import React from 'react';

function AdminModifyModal({ModifyData,CateList,onModifySubmit}) {
  return (
    <Form 
      className="admin-prod-form" 
      onFinish={onModifySubmit}
      initialValues={{
        'name': ModifyData.name,
        'category': ModifyData.category,
        'ea': ModifyData.ea,
        'etc': ModifyData.etc,
        'unit': ModifyData.unit,
        'alert_ea': ModifyData.alert_ea,
      }}
      >
      {ModifyData.category}
      <Form.Item
        name="name"
        label="상품명"  
        rules={[
          {
            required: true,
            message: "상품명을 입력해 주세요",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item 
        label="품목" 
        name="category"
        rules={[
          {
            required: true,
            message: "품목을 입력해 주세요",
          }
        ]}
      >
        <Radio.Group>
          {
            CateList && CateList.map(el=>(
              <>
                <Radio.Button value={el}>{el}</Radio.Button>
              </>
            ))
          }
        </Radio.Group>
      </Form.Item>      
      <Form.Item
        name="etc"
        label="비고"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="unit"
        label="단위"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="alert_ea"
        label="알림수량"
      >
        <InputNumber />
      </Form.Item>
      <div
        className="btn-box"
        style={{ width: "100%", textAlign: "center" }}
      >
        <Button
          htmlType="submit"
          type="primary"
          size="large"
        >
          수정하기
        </Button>
      </div>
    </Form>
  )
}

export default AdminModifyModal