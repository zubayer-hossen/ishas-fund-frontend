// components/Header.js
import React from 'react';
import { Typography } from 'antd';
import { FundOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Header = () => {
  return (
    <div style={{
      backgroundColor: '#1a73e8',
      padding: '20px',
      textAlign: 'center',
      color: 'white',
      borderRadius: '0 0 10px 10px',
      marginBottom: '30px',
    }}>
      <Title level={2} style={{ color: 'white', margin: 0 }}>
        <FundOutlined style={{ marginRight: '10px' }} />
        Fund & Expense Manager
      </Title>
    </div>
  );
};

export default Header;
