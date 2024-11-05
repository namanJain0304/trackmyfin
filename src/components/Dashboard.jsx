import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Cards from "./Cards";
import moment from "moment";
import { Card, Row } from "antd";
import { Line, Pie } from "@ant-design/charts";
import AddExpenseModal from "./Modals/AddExpenseModal";
import AddIncomeModal from "./Modals/AddIncomeModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs, query , deleteDoc,where,updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import TransactionSearch from "./TransctionSearch";
import { unparse } from "papaparse";


const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); 
  const processChartData = () => {
    const balanceData = [];
    const spendingData = {};
  
    transactions.forEach((transaction) => {
      const monthYear = moment(transaction.date).format("MMM YYYY");
      const tag = transaction.tag;
  
      if (transaction.type === "income") {
        if (balanceData.some((data) => data.month === monthYear)) {
          balanceData.find((data) => data.month === monthYear).balance +=
            transaction.amount;
        } else {
          balanceData.push({ month: monthYear, balance: transaction.amount, date: moment(transaction.date) });
        }
      } else {
        if (balanceData.some((data) => data.month === monthYear)) {
          balanceData.find((data) => data.month === monthYear).balance -=
            transaction.amount;
        } else {
          balanceData.push({ month: monthYear, balance: -transaction.amount, date: moment(transaction.date) });
        }
  
        if (spendingData[tag]) {
          spendingData[tag] += transaction.amount;
        } else {
          spendingData[tag] = transaction.amount;
        }
      }
    });
  
    // Sort the balanceData array by the `date` field
    balanceData.sort((a, b) => a.date - b.date);
  
    // Remove the `date` field before returning the data, as it's not needed in the chart config
    const formattedBalanceData = balanceData.map(({ date, ...rest }) => rest);
  
    const spendingDataArray = Object.keys(spendingData).map((key) => ({
      category: key,
      value: spendingData[key],
    }));
  
    return { balanceData: formattedBalanceData, spendingDataArray };
  };
  
  const { balanceData, spendingDataArray } = processChartData();

  const showExpenseModal = () => {
    setIsExpenseModalVisible(true);
  };

  const showIncomeModal = () => {
    setIsIncomeModalVisible(true);
  };

  const handleExpenseCancel = () => {
    setIsExpenseModalVisible(false);
  };

  const handleIncomeCancel = () => {
    setIsIncomeModalVisible(false);
  };

  const cardStyle = {
    boxShadow: "0px 0px 30px 8px rgba(227, 227, 227, 0.75)",
    margin: "2rem",
    borderRadius: "0.5rem",
    minWidth: "400px",
    flex: 1,
  };
  const onFinish = (values, type) => {
    const newTransaction = {
      type: type,
      date: values.date.format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setTransactions([...transactions, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    addTransaction(newTransaction);
    calculateBalance();
  };

  async function addTransaction(transaction) {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      console.log("Document written with ID: ", docRef.id);
      toast.success("Added Transaction");
    } catch (e) {
      console.error("Error adding document: ", e);

      toast.error("Couldn't add transaction");
    }
  }
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      let transactionsArray = [];
      querySnapshot.forEach((doc) => {
        transactionsArray.push(doc.data());
      });
      setTransactions(transactionsArray);
      toast.success("Transactions Fetched!");
    }
  }
  // Calculate the initial balance, income, and expenses
  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        incomeTotal += transaction.amount;
      } else {
        expensesTotal += transaction.amount;
      }
    });

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  const balanceConfig = {
    data: balanceData,
    xField: "month",
    yField: "balance",
  };

  const spendingConfig = {
    data: spendingDataArray,
    angleField: "value",
    colorField: "category",
  };

  function reset() {
    if (user) {
      deleteTransactions(); // Call the delete function
    }
  }
  
  async function deleteTransactions() {
    try {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
  
      // Iterate through each transaction and delete it
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
  
      // Wait for all delete operations to complete
      await Promise.all(deletePromises);
  
      // Reset the state to clear the current balance, income, and expenses
      setTransactions([]);
      setIncome(0);
      setExpenses(0);
      setCurrentBalance(0);
  
      toast.success("All transactions have been reset!");
    } catch (error) {
      console.error("Error resetting transactions: ", error);
      toast.error("Could not reset transactions.");
    }
  }

  
  


  function exportToCsv() {
    const csv = unparse(transactions, {
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function onEditFinish(updatedTransaction){
    console.log("transactions",transactions[0]);
    console.log('updatedTransaction',updatedTransaction);
    const formattedTransaction = {
      ...updatedTransaction,
      date: updatedTransaction.date.format("YYYY-MM-DD"),
      amount: Number(updatedTransaction.amount), // Ensure date is properly formatted
    };
    const updatedTransactions = transactions.map((transaction) =>
          //console.log('here',transaction.name,updatedTransaction.name);
          transaction.name === updatedTransaction.name ?{ ...formattedTransaction } : transaction          
        );
    console.log("transactions",transactions.id);
    console.log("updatedTransactions",updatedTransaction.id);
    setTransactions(updatedTransactions);
    const q = query(
      collection(db,  `users/${user.uid}/transactions`), 
      where("name", "==", updatedTransaction.name) // Assuming 'name' is the field you're querying on
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
    querySnapshot.forEach(async (docSnapshot) => {
      const docRef = docSnapshot.ref;
      console.log("docref is ",docRef);
      try{
        await updateDoc(docRef, formattedTransaction);
        toast.success("Transaction successfully updated in Firestore based on name!");
      }
      catch(error){
        toast.error("Could not update transaction in Firestore");
        }
     
      console.log("ended")
    })
  }
  else {
    console.log("No transaction found with the specified name.");
  }

    console.log('q is',querySnapshot);
    console.log("UPDATED ")
    
    setIsEditModalVisible(false);



  }
  return (
    <div className="dashboard-container">
      <Navbar />{" "}
      <>
        <Cards
          currentBalance={currentBalance}
          income={income}
          expenses={expenses}
          showExpenseModal={showExpenseModal}
          showIncomeModal={showIncomeModal}
          cardStyle={cardStyle}
          reset={reset}
        />

        <AddExpenseModal
          isExpenseModalVisible={isExpenseModalVisible}
          handleExpenseCancel={handleExpenseCancel}
          onFinish={onFinish}
        />
        <AddIncomeModal
          isIncomeModalVisible={isIncomeModalVisible}
          handleIncomeCancel={handleIncomeCancel}
          onFinish={onFinish}
        />
         <Row gutter={16}>
                <Card bordered={true} style={cardStyle}>
                  <h2>Financial Statistics</h2>
                  {
                    balanceData.length==0?(<p>Seems like you havent added any income or expense....</p>):(
                      <Line {...{ ...balanceConfig, data: balanceData }} />

                    )
                  }
                </Card>

                <Card bordered={true} style={{ ...cardStyle, flex: 0.45 }}>
                  <h2>Total Spending</h2>
                  {spendingDataArray.length == 0 ? (
                    <p>Seems like you haven't spent anything till now...</p>
                  ) : (
                    <Pie {...{ ...spendingConfig, data: spendingDataArray }} />
                  )}
                </Card>
              </Row>
         <TransactionSearch
            transactions={transactions}
            exportToCsv={exportToCsv}
            fetchTransactions={fetchTransactions}
            addTransaction={addTransaction}
            onEditFinish={onEditFinish}
            isEditModalVisible={isEditModalVisible}
            setIsEditModalVisible={setIsEditModalVisible}
  

            
          />
      </>
    </div>
  );
};

export default Dashboard;
