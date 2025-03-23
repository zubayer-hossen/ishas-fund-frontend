import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Input, Select, Space, Card, Col, Row, Typography, Divider } from 'antd';
import { AppstoreAddOutlined, LogoutOutlined } from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import { baseUrl, secret } from './constants/constants';

const { Option } = Select;
const { Title } = Typography;

function App() {
  const [funds, setFunds] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isSecretKeyValid, setIsSecretKeyValid] = useState(false);

  useEffect(() => {
    const storedSecretKey = localStorage.getItem('secretKey');
    if (storedSecretKey === secret) {
      setIsSecretKeyValid(true);
    }
  }, []);

  useEffect(() => {
    if (isSecretKeyValid) {
      axios.get(`${baseUrl}/funds`).then(res => setFunds(res.data)).catch(() => toast.error('Error fetching funds'));
      axios.get(`${baseUrl}/expenses`).then(res => setExpenses(res.data)).catch(() => toast.error('Error fetching expenses'));
    }
  }, [isSecretKeyValid]);

  const totalDonors = [...new Set(funds.map(f => f.name))].length;
  const totalCollections = funds.reduce((acc, f) => acc + parseFloat(f.amount), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const balance = totalCollections - totalExpenses;

  const fundValidationSchema = Yup.object({
    name: Yup.string().min(3).required('Name is required'),
    amount: Yup.number().positive().required('Amount is required'),
    mobileNumber: Yup.string().matches(/^(01[3-9]\d{8})$/, 'Invalid mobile number').required('Required'),
    donationType: Yup.string().required('Required'),
  });

  const expenseValidationSchema = Yup.object({
    description: Yup.string().required('Description is required'),
    amount: Yup.number().positive().required('Amount is required'),
  });

  const handleFundSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(`${baseUrl}/add-fund`, values);
      if (response.data.success) {
        toast.success(response.data.message);
        setFunds([...funds, values]);
        resetForm();
      } else toast.error(response.data.message);
    } catch {
      toast.error('Error adding fund');
    }
  };

  const handleExpenseSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(`${baseUrl}/add-expense`, values);
      if (response.data.success) {
        toast.success(response.data.message);
        setExpenses([...expenses, values]);
        resetForm();
      } else toast.error(response.data.message);
    } catch {
      toast.error('Error adding expense');
    }
  };

  const filteredFunds = funds.filter(f => f.name.toLowerCase().includes(searchText.toLowerCase()) || f.transactionId.toLowerCase().includes(searchText.toLowerCase()));
  const formatDate = date => new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const fundColumns = [
    { title: 'S.No', render: (_, __, index) => index + 1 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Amount', dataIndex: 'amount' },
    { title: 'Donation Type', dataIndex: 'donationType' },
    { title: 'Mobile Number', dataIndex: 'mobileNumber' },
    { title: 'Date', dataIndex: 'date', render: formatDate },
    { title: 'Transaction ID', dataIndex: 'transactionId' },
  ];

  const expenseColumns = [
    { title: 'S.No', render: (_, __, index) => index + 1 },
    { title: 'Description', dataIndex: 'description' },
    { title: 'Amount', dataIndex: 'amount' },
    { title: 'Date', dataIndex: 'date', render: formatDate },
    { title: 'Transaction ID', dataIndex: 'transactionId' },
  ];

  const handleSecretKeySubmit = (e) => {
    e.preventDefault();
    const key = e.target.secretKey.value;
    if (key === secret) {
      localStorage.setItem('secretKey', key);
      setIsSecretKeyValid(true);
      toast.success('Access granted');
    } else toast.error('Invalid secret key');
  };

  const handleLogout = () => {
    localStorage.removeItem('secretKey');
    toast.success('Logged out');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="container">
      <Header />
      {!isSecretKeyValid ? (
        <form onSubmit={handleSecretKeySubmit} className="secret-form">
          <Input.Password name="secretKey" placeholder="Enter Secret Key" className="secret-input" />
          <Button type="primary" htmlType="submit" className="secret-button">Submit</Button>
        </form>
      ) : (
        <>
          <Row gutter={[16, 16]} justify="center" className="summary-row">
            <Col xs={24} sm={12} md={6}><Card className="stats-card" title="Total Donors"><h2>{totalDonors}</h2></Card></Col>
            <Col xs={24} sm={12} md={6}><Card className="stats-card" title="Collections"><h2>${totalCollections.toFixed(2)}</h2></Card></Col>
            <Col xs={24} sm={12} md={6}><Card className="stats-card" title="Expenses"><h2>${totalExpenses.toFixed(2)}</h2></Card></Col>
            <Col xs={24} sm={12} md={6}><Card className="stats-card" title="Balance"><h2>${balance.toFixed(2)}</h2></Card></Col>
          </Row>

          <Divider orientation="center">Add New Fund</Divider>
          <Formik initialValues={{ name: '', amount: '', donationType: 'Iftar Mahfil', mobileNumber: '' }} validationSchema={fundValidationSchema} onSubmit={handleFundSubmit}>
            {({ errors, touched }) => (
              <Form className="form-section">
                <Space wrap>
                  <Field name="name" as={Input} placeholder="Name" status={touched.name && errors.name ? 'error' : ''} />
                  <Field name="amount" type="number" as={Input} placeholder="Amount" status={touched.amount && errors.amount ? 'error' : ''} />
                  <Field name="donationType" as={Select} style={{ width: 150 }}>
                    <Option value="Iftar Mahfil">Iftar</Option>
                    <Option value="Charity" disabled>Charity</Option>
                    <Option value="Zakat" disabled>Zakat</Option>
                    <Option value="Others" disabled>Others</Option>
                  </Field>
                  <Field name="mobileNumber" as={Input} placeholder="Mobile Number" status={touched.mobileNumber && errors.mobileNumber ? 'error' : ''} />
                  <Button type="primary" htmlType="submit" icon={<AppstoreAddOutlined />}>Add Fund</Button>
                </Space>
              </Form>
            )}
          </Formik>

          <Divider orientation="center">Add Expense</Divider>
          <Formik initialValues={{ description: '', amount: '' }} validationSchema={expenseValidationSchema} onSubmit={handleExpenseSubmit}>
            {({ errors, touched }) => (
              <Form className="form-section">
                <Space wrap>
                  <Field name="description" as={Input} placeholder="Expense Description" status={touched.description && errors.description ? 'error' : ''} />
                  <Field name="amount" type="number" as={Input} placeholder="Amount" status={touched.amount && errors.amount ? 'error' : ''} />
                  <Button type="primary" htmlType="submit" icon={<AppstoreAddOutlined />}>Add Expense</Button>
                </Space>
              </Form>
            )}
          </Formik>

          <Divider orientation="center">Search</Divider>
          <Input.Search
            placeholder="Search by Name or Transaction ID"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            enterButton
            style={{ marginBottom: '20px' }}
          />

          <Divider orientation="center">Fund Records</Divider>
          <div className="table-container">
            <Table columns={fundColumns} dataSource={filteredFunds} rowKey="transactionId" pagination={{ pageSize: 5 }} scroll={{ x: 'max-content' }} />
          </div>

          <Divider orientation="center">Expense Records</Divider>
          <div className="table-container">
            <Table columns={expenseColumns} dataSource={expenses} rowKey="transactionId" pagination={{ pageSize: 5 }} scroll={{ x: 'max-content' }} />
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button type="primary" icon={<LogoutOutlined />} danger onClick={handleLogout}>Logout</Button>
          </div>
        </>
      )}

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;
