import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler);

function Home() {
  const [abonnesCount, setAbonnesCount] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [empruntsCount, setEmpruntsCount] = useState(0);  // Count of all emprunts
  const [empruntsTodayCount, setEmpruntsTodayCount] = useState(0);  // Count of emprunts today
  const [empruntsRetourTodayCount, setEmpruntsRetourTodayCount] = useState(0);  // Count of emprunts returned today
  const [documentCategories, setDocumentCategories] = useState([]);
  const [documentsByYear, setDocumentsByYear] = useState([]);

  const [chartData, setChartData] = useState(null);  
  const [lineChartData, setLineChartData] = useState(null);  // For the Line Chart

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

      // Count emprunts today
      const empruntsToday = countEmpruntsToday(empruntsResponse.data);
      setEmpruntsTodayCount(empruntsToday);

      // Count emprunts returned today
      const empruntsRetourToday = countEmpruntsRetourToday(empruntsResponse.data);
      setEmpruntsRetourTodayCount(empruntsRetourToday);

      // Fetch document categories
      const categories = documentsResponse.data.map(doc => doc.category);
      const uniqueCategories = [...new Set(categories)]; 

      setDocumentCategories(uniqueCategories);

      // Create a count for each category
      const categoryCounts = uniqueCategories.map(category => 
        documentsResponse.data.filter(doc => doc.category === category).length
      );

      setChartData({
        labels: uniqueCategories,
        datasets: [
          {
            label: 'Nombre de Documents par Catégorie',
            data: categoryCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      });

      // Process documents for yearly analysis using the 'annee' field
      const documentsData = documentsResponse.data;
      const yearlyCounts = processYearlyDocuments(documentsData);

      setLineChartData({
        labels: Object.keys(yearlyCounts), // Years
        datasets: [
          {
            label: 'Nombre de Documents par Année',
            data: Object.values(yearlyCounts),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true, // To create a filled curve
            tension: 0.4, // For a smooth curve
            pointRadius: 4,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      });

    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  // Helper function to count emprunts made today
  const countEmpruntsToday = (emprunts) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));  // Set to midnight today
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Set to the last moment of today

    // Filter emprunts that occurred today
    const empruntsToday = emprunts.filter(emprunt => {
      const empruntDate = new Date(emprunt.date_emprunt);  // Assuming `date_emprunt` is the field
      return empruntDate >= startOfDay && empruntDate <= endOfDay;
    });

    return empruntsToday.length;
  };

  // Helper function to count emprunts returned today
  const countEmpruntsRetourToday = (emprunts) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));  // Set to midnight today
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Set to the last moment of today

    // Filter emprunts that were returned today
    const empruntsRetourToday = emprunts.filter(emprunt => {
      const retourDate = new Date(emprunt.date_retour);  // Assuming `date_retour` is the field
      return retourDate >= startOfDay && retourDate <= endOfDay;
    });

    return empruntsRetourToday.length;
  };

  // Helper function to group documents by year using the 'annee' field
  const processYearlyDocuments = (documents) => {
    const yearlyCounts = {};

    documents.forEach((doc) => {
      const year = doc.annee;  // Using the 'annee' field for the year

      if (yearlyCounts[year]) {
        yearlyCounts[year] += 1;
      } else {
        yearlyCounts[year] = 1;
      }
    });

    return yearlyCounts;
  };

  // Function to handle the update API request
  const deleteEmpruntsRetourToday = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/delete_today`);
      alert("Emprunts retournés aujourd'hui supprimés avec succès !");
      fetchCounts();  // Refresh counts after the deletion
    } catch (error) {
      console.error("Erreur lors de la suppression des emprunts retournés aujourd'hui :", error);
      alert("Erreur lors de la suppression des emprunts.");
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
        <div style={styles.statItem}>
          <h3 style={styles.statTitle}>Emprunts Aujourd'hui</h3>
          <p style={styles.statCount}>{empruntsTodayCount} emprunts</p>
        </div>
        <div style={styles.statItem}>
          <h3 style={styles.statTitle}>Emprunts Retour Aujourd'hui</h3>
          <p style={styles.statCount}>{empruntsRetourTodayCount} retours</p>
          <button style={styles.updateButton} onClick={deleteEmpruntsRetourToday}>
            Mettre à jour
          </button>
        </div>
      </div>

      {/* Container for both charts side by side */}
      <div style={styles.chartRow}>
        {/* Bar Chart */}
        <div style={styles.chartItem}>
          <h3 style={styles.chartTitle}>Répartition des Documents par Catégorie</h3>
          {chartData ? (
            <Bar data={chartData} options={barChartOptions} />
          ) : (
            <p>Chargement des données...</p>
          )}
        </div>

        {/* Line Chart for Documents per Year */}
        <div style={styles.chartItem}>
          <h3 style={styles.chartTitle}>Analyse des Documents par Année</h3>
          {lineChartData ? (
            <Line data={lineChartData} options={lineChartOptions} />
          ) : (
            <p>Chargement des données...</p>
          )}
        </div>
      </div>

    </div>
  );
}

const barChartOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Répartition des Documents par Catégorie',
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

const lineChartOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Documents par Année',
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
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: '30px',
  },
  statItem: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '10px',
    textAlign: 'center',
    flex: '1 1 200px',
  },
  statTitle: {
    fontSize: '18px',
    color: '#333',
  },
  statCount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
  },
  updateButton: {
    marginTop: '10px',
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  chartRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  chartItem: {
    flex: '1 1 48%',
    margin: '10px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  chartTitle: {
    fontSize: '20px',
    marginBottom: '10px',
    textAlign: 'center',
    color: '#333',
  },
};

export default Home;
