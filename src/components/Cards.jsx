import React from "react";
import { Button, Card, Row } from "antd";

function Cards({
  currentBalance,
  income,
  expenses,

  showExpenseModal,
  showIncomeModal,
  cardStyle,
  reset
}) {
  return (
    <Row
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "space-between",
      }}
    >
      <Card bordered={true} style={cardStyle}>
        <h2>Current Balance</h2>
        <p>₹{currentBalance}</p>
        <Button type="primary" onClick={reset}>Reset Balance</Button>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Total Income</h2>
        <p>₹{income}</p>
        <Button type="primary" onClick={showIncomeModal}>
          Add Income
        </Button>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Total Expenses</h2>
        <p>₹{expenses}</p>
        <Button type="primary" onClick={showExpenseModal}>
          Add Expense
        </Button>
      </Card>
    </Row>
  );
}

export default Cards;
