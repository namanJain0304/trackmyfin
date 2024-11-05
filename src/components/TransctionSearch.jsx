import React, { useRef, useState,useEffect } from "react";
import { Input, Table, Select, Radio, Button, Row, Col, Modal, Form,DatePicker } from "antd";
import search from "../assets/search.svg";
import { parse } from "papaparse";
import { toast } from "react-toastify";
import moment from "moment";



const { Search } = Input;
const { Option } = Select;

const TransactionSearch = ({
  transactions,
  exportToCsv,
  addTransaction,
  fetchTransactions,
  onEditFinish,
  isEditModalVisible,
  setIsEditModalVisible,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const fileInput = useRef();
  const [editingTransaction, setEditingTransaction] = useState(null); // For the selected transaction
// To toggle the modal


const handleEditTransaction = (transaction) => {
  setEditingTransaction(transaction);  // Store the transaction to edit
  setIsEditModalVisible(true);  // Show the modal
};


  function importFromCsv(event) {
    event.preventDefault();
    try {
      parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            const newTransaction = {
              ...transaction,
              amount: parseInt(transaction.amount),
            };
            await addTransaction(newTransaction, true);
          }
        },
      });
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.files = null;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button onClick={() => handleEditTransaction(record)}>Edit</Button>
      ),
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = searchTerm
      ? transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;

    return searchMatch && typeMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0;
    }
  });

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));

  const EditTransactionModal = ({ visible, onCancel, onFinish, transaction }) => {
    const [form] = Form.useForm();
  
    useEffect(() => {
      if (transaction) {
        form.setFieldsValue({
          name: transaction.name,
          type: transaction.type,
          date: moment(transaction.date),
          amount: transaction.amount,
          tag: transaction.tag,
        });
      }
    }, [transaction]);
  
    return (
      <Modal
        title="Edit Transaction"
        visible={visible}
        onCancel={onCancel}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              console.log(values, transaction.key);
              onEditFinish({ ...values});
              form.resetFields();
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name"  label="Name" rules={[{ required: true }]}>
            <Input disabled={true} />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="income">Income</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tag" label="Tag" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
  };


  

  return (
    <>
      {/* Search and Filter Section */}
      <div className="container shadow-lg">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={16}>
            <Input
              className="shadow-lg"
              size="large"
              placeholder="Search by Name"
              style={{ width: "100%" }}
              prefix={<img src={search} width="16" />}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              className="shadow-lg"
              showSearch
              placeholder="Filter"
              value={typeFilter}
              style={{ width: "100%" }}
              onChange={(value) => setTypeFilter(value)}
              options={[
                {
                  value: "",
                  label: "All",
                },
                {
                  value: "income",
                  label: "Income",
                },
                {
                  value: "expense",
                  label: "Expense",
                },
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* Transactions Table Section */}
      <div className="container shadow-lg mt-2">
        <div className="my-table">
          <Row justify="space-between" align="middle" style={{ marginBottom: "1rem" }}>
            <Col xs={24} md={12}>
              <h2>My Transactions</h2>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: "right" }}>
              <Radio.Group
                className="input-radio"
                onChange={(e) => setSortKey(e.target.value)}
                value={sortKey}
              >
                <Radio.Button value="">No Sort</Radio.Button>
                <Radio.Button value="date">Sort by Date</Radio.Button>
                <Radio.Button value="amount">Sort by Amount</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
          <Row justify="end" align="middle" style={{ gap: "1rem", marginBottom: "1rem" }}>
            <Button type="primary" onClick={exportToCsv}>
              Export to CSV
            </Button>
            <Button type="primary">
              <label htmlFor="file-csv" style={{ cursor: "pointer" }}>
                Import from CSV
              </label>
            </Button>
            <input
              onChange={importFromCsv}
              id="file-csv"
              type="file"
              accept=".csv"
              required
              style={{ display: "none" }}
            />
          </Row>
          <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 800 }} // Enable horizontal scrolling
          />
        </div>
      </div>

      <EditTransactionModal
  visible={isEditModalVisible}
  transaction={editingTransaction}
  onCancel={() => setIsEditModalVisible(false)}
  onFinish={onEditFinish}
/>


      {/* Custom Styles */}
      <style jsx>{`
        .container {
          width: 100%;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .my-table {
            font-size: 0.9rem;
          }
          .input-radio {
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 480px) {
          .my-table h2 {
            font-size: 1.2rem;
          }
          .input-radio {
            display: block;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default TransactionSearch;
