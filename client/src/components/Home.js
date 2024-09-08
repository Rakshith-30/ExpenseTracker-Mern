import React, { useEffect, useState } from "react";
import moment from "moment";
import DoughnutChart from "./DoughnutChart";
import Popup from "../assets/popup.png";
import { Link, useNavigate } from "react-router-dom";
import { Segregator } from "../utilities/Categorysegregator";
import ReactTooltip from "react-tooltip";
let TotalSpent = 0;

export default function Home(props) {
  const navigate = useNavigate();
  const [totalBudget, setTotalBudget] = useState();
  const [tooltip, showTooltip] = useState(true);
  const [expenseData, SetExpenseData] = useState({
    datasets: [
      {
        label: "Expense",
        data: [],
        borderColor: "black",
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(255, 205, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(201, 203, 207, 0.6)",
        ],
      },
    ],
    labels: [],
  });
  const [monthlyBudget, setMonthlyBudget] = useState({
    datasets: [
      {
        data: [],
        borderColor: "black",
        backgroundColor: ["#f87171", "#fbbf24"],
      },
    ],
  });

  useEffect(() => {
    const startDate = new Date();
    const date = {
      startdate: new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      ).toDateString(),
      enddate: new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + 1
      ).toDateString(),
    };

    const getHomeChartdata = async () => {
      const res = await fetch("/expense/viewexpenseinrange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(date),
      });

      let data = await res.json();

      if (data.errors) {
        navigate("/");
      } else {
        const Segregated = Segregator(data.expense);
        TotalSpent = Segregated[1];
        SetExpenseData({
          datasets: [
            {
              label: "Expense",
              data: Object.values(Segregated[0]),
              borderColor: "black",
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(255, 159, 64, 0.6)",
                "rgba(255, 205, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(201, 203, 207, 0.6)",
              ],
            },
          ],
          labels: Object.keys(Segregated[0]),
        });
      }
    };

    const handleGetBudget = async () => {
      const res = await fetch("/expense/getBudget");
      let data = await res.json();
      setTotalBudget(data.budget.$numberDecimal);
      let remaining = data.budget.$numberDecimal - TotalSpent;

      if (remaining < 0) {
        remaining = 0;
      }

      if (data.error) {
        navigate("/");
      } else {
        setMonthlyBudget({
          datasets: [
            {
              data: [TotalSpent, remaining],
              borderColor: "black",
              backgroundColor: ["#ff6b6b", "#ffe66d"],
            },
          ],
        });
      }
    };

    handleGetBudget();
    getHomeChartdata();
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Budget Section */}
      <div style={styles.budgetSection}>
        <div style={styles.budgetHeader}>
          <p>Spend from {moment().format("MMM 1")} - {moment().format("MMM D")}</p>
          <p>{Math.floor((TotalSpent / totalBudget) * 100)}% budget used</p>
        </div>

        <div style={styles.budgetInfo}>
          <div style={styles.budgetAmount}>
            <h3 style={styles.amountText}>
              ₹<span style={styles.amountValue}>{TotalSpent}</span> / ₹{totalBudget}
            </h3>
            <button
              onClick={props.openModalBudget}
              style={styles.budgetButton}
              data-tip="Set Budget"
              onMouseEnter={() => showTooltip(true)}
              onMouseLeave={() => {
                showTooltip(false);
                setTimeout(() => showTooltip(true), 50);
              }}
            >
              <img src={Popup} alt="Set Budget" style={styles.popupIcon} />
            </button>
            {tooltip && <ReactTooltip place="bottom" type="dark" effect="solid" />}
          </div>
          <div style={styles.chartContainer}>
            <DoughnutChart chartData={monthlyBudget} />
          </div>
        </div>
      </div>

      {/* Expense Section */}
      <div style={styles.expenseSection}>
        <DoughnutChart chartData={expenseData} />
      </div>

      {/* Spend Analysis Section */}
      <Link to="dailyspendanalysis" style={styles.analysisLink}>
        <div style={styles.analysisButton}>
          <h1 style={styles.analysisText}>Spend Analysis</h1>
        </div>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f0f0f0",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  budgetSection: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
    backgroundColor: "#dce775",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  budgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  budgetInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  budgetAmount: {
    display: "flex",
    alignItems: "center",
  },
  amountText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
  },
  amountValue: {
    fontSize: "26px",
    color: "#388e3c",
  },
  budgetButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    marginLeft: "10px",
    padding: "5px",
  },
  popupIcon: {
    width: "25px",
  },
  chartContainer: {
    width: "80px",
  },
  expenseSection: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    marginTop: "20px",
    maxWidth: "800px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: "auto",
  },
  analysisLink: {
    textDecoration: "none",
  },
  analysisButton: {
    backgroundColor: "#8bc34a",
    borderRadius: "10px",
    marginTop: "20px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    maxWidth: "800px",
    margin: "auto",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s ease",
  },
  analysisButtonHover: {
    backgroundColor: "#7cb342",
  },
  analysisText: {
    fontSize: "24px",
    color: "#fff",
    fontWeight: "700",
  },
};
