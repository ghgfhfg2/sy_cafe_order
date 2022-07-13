import React from 'react';
import {Radio} from 'antd'

function ProdCategory() {
  return (
    <>
      <Radio.Button value="all">전체</Radio.Button>
      <Radio.Button value="커피">커피</Radio.Button>
      <Radio.Button value="라떼">라떼</Radio.Button>
      <Radio.Button value="에이드">에이드</Radio.Button>
      <Radio.Button value="차">차</Radio.Button>
      <Radio.Button value="프로틴">프로틴</Radio.Button>
      <Radio.Button value="스낵">스낵</Radio.Button>
      <Radio.Button value="셀프">셀프</Radio.Button>    
    </>
  )
}

export default ProdCategory