import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Home() {
  const [abonnesCount, setAbonnesCount] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [empruntsCount, setEmpruntsCount] = useState(0);

  const [chartData, setChartData] = useState(null);  // Initialize as null
  const [pieChartData, setPieChartData] = useState(null);  // Initialize as null

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const abonnesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/abonnés`);
      const documentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/documents`);
      const empruntsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/emprunts`);

      const abonnes = abonnesResponse.data.length;
      const documents = documentsResponse.data.length;
      const emprunts = empruntsResponse.data.length;

      setAbonnesCount(abonnes);
      setDocumentsCount(documents);
      setEmpruntsCount(emprunts);

      setChartData({
        labels: ['Abonnés', 'Documents', 'Emprunts'],
        datasets: [
          {
            label: 'Nombre',
            data: [abonnes, documents, emprunts],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      });

      setPieChartData({
        labels: ['Abonnés', 'Documents', 'Emprunts'],
        datasets: [
          {
            data: [abonnes, documents, emprunts],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      });

    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Statistiques du Système</h2>

      <div style={styles.statsContainer}>
        <div style={styles.statItem}>
          <h3 style={styles.statTitle}>Abonnés</h3>
          <p style={styles.statCount}>{abonnesCount} abonnés</p>
        </div>
        <div style={styles.statItem}>
          <h3 style={styles.statTitle}>Documents</h3>
          <p style={styles.statCount}>{documentsCount} documents</p>
        </div>
        <div style={styles.statItem}>
          <h3 style={styles.statTitle}>Emprunts</h3>
          <p style={styles.statCount}>{empruntsCount} emprunts</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Répartition des Abonnés, Documents, et Emprunts</h3>
        {chartData ? (
          <Bar data={chartData} options={barChartOptions} />
        ) : (
          <p>Chargement des données...</p>
        )}
      </div>

      {/* Pie Chart */}
      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Distribution des Entités</h3>
        {pieChartData ? (
          <Pie data={pieChartData} options={pieChartOptions} />
        ) : (
          <p>Chargement des données...</p>
        )}
      </div>
    </div>
  );
}

const barChartOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Répartition des entités',
      font: {
        size: 18,
      },
      color: '#333',
    },
    tooltip: {
      enabled: true,
    },
  },
};

const pieChartOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Distribution des Entités',
      font: {
        size: 18,
      },
      color: '#333',
    },
    tooltip: {
      enabled: true,
    },
  },
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Helvetica Neue', sans-serif",
    textAlign: "center",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "30px",
  },
  statItem: {
    backgroundColor: "#f9f9f9",
    padding: "25px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "30%",
    textAlign: "center",
    transition: "transform 0.3s ease-in-out",
  },
  statItemHover: {
    transform: "scale(1.05)",
  },
  statTitle: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "10px",
  },
  statCount: {
    fontSize: "18px",
    fontWeight: "400",
    color: "#555",
  },
  chartContainer: {
    marginTop: "50px",
    width: "100%",
  },
  chartTitle: {
    fontSize: "22px",
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: "20px",
  },
};

export default Home;
