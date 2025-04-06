// API Base URL - Update this to match your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const medicineForm = document.getElementById('medicine-form');
const intakeForm = document.getElementById('intake-form');
const medicineSelect = document.getElementById('medicine-select');
const filterMedicine = document.getElementById('filter-medicine');
const filterStatus = document.getElementById('filter-status');
const dateFrom = document.getElementById('date-from');
const dateTo = document.getElementById('date-to');
const applyFilters = document.getElementById('apply-filters');
const historyData = document.getElementById('history-data');
const adherenceRate = document.getElementById('adherence-rate');
const missedCount = document.getElementById('missed-count');
const delayedCount = document.getElementById('delayed-count');

// Set default date range (last 7 days)
const today = new Date();
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);

dateFrom.valueAsDate = lastWeek;
dateTo.valueAsDate = today;

// Data storage
let medicines = [];
let medicineLogs = [];

// API endpoints
const API = {
  MEDICINES: `${API_BASE_URL}/medicines`,
  MEDICINE_LOGS: `${API_BASE_URL}/medicine-logs`
};

// Fetch medicines from API
async function fetchMedicines() {
  try {
    const response = await fetch(API.MEDICINES);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    medicines = await response.json();
    populateMedicineDropdowns();
  } catch (error) {
    console.error('Error fetching medicines:', error);
    showNotification('Failed to load medicines', 'error');
  }
}

// Fetch medicine logs from API
async function fetchMedicineLogs(filters = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters.medicine_id) queryParams.append('medicine_id', filters.medicine_id);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);
    
    const url = `${API.MEDICINE_LOGS}?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    medicineLogs = await response.json();
    renderMedicineHistory();
    updateDashboard();
  } catch (error) {
    console.error('Error fetching medicine logs:', error);
    showNotification('Failed to load medicine history', 'error');
  }
}

// Populate medicine dropdowns
function populateMedicineDropdowns() {
  // Clear existing options
  medicineSelect.innerHTML = '<option value="">Select a medicine</option>';
  filterMedicine.innerHTML = '<option value="">All Medicines</option>';
  
  // Add medicine options
  medicines.forEach(medicine => {
    const option1 = document.createElement('option');
    option1.value = medicine.id;
    option1.textContent = medicine.name;
    medicineSelect.appendChild(option1);
    
    const option2 = document.createElement('option');
    option2.value = medicine.id;
    option2.textContent = medicine.name;
    filterMedicine.appendChild(option2);
  });
}

// Render medicine history table
function renderMedicineHistory() {
  historyData.innerHTML = '';
  
  if (medicineLogs.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" style="text-align: center;">No records found</td>';
    historyData.appendChild(row);
    return;
  }
  
  medicineLogs.forEach(log => {
    const medicine = medicines.find(m => m.id === log.medicine_id);
    const row = document.createElement('tr');
    
    // Format dates
    const scheduledTime = new Date(log.scheduled_datetime).toLocaleString();
    const takenTime = log.taken_datetime ? new Date(log.taken_datetime).toLocaleString() : 'N/A';
    
    row.innerHTML = `
      <td>${medicine ? medicine.name : 'Unknown'}</td>
      <td>${medicine ? medicine.dosage : 'N/A'}</td>
      <td>${scheduledTime}</td>
      <td>${takenTime}</td>
      <td class="status-${log.status}">${log.status.charAt(0).toUpperCase() + log.status.slice(1)}</td>
      <td>${log.notes || ''}</td>
    `;
    
    historyData.appendChild(row);
  });
}

// Update dashboard statistics
function updateDashboard() {
  const total = medicineLogs.length;
  const missed = medicineLogs.filter(log => log.status === 'missed').length;
  const delayed = medicineLogs.filter(log => log.status === 'delayed').length;
  const taken = medicineLogs.filter(log => log.status === 'taken').length;
  
  const adherencePercentage = total > 0 ? Math.round((taken / total) * 100) : 0;
  
  adherenceRate.textContent = `${adherencePercentage}%`;
  missedCount.textContent = missed;
  delayedCount.textContent = delayed;
  
  // Update chart
  updateAdherenceChart(taken, missed, delayed);
}

// Create adherence chart
function updateAdherenceChart(taken, missed, delayed) {
  const ctx = document.getElementById('adherence-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.adherenceChart) {
    window.adherenceChart.destroy();
  }
  
  window.adherenceChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Taken', 'Missed', 'Delayed'],
      datasets: [{
        data: [taken, missed, delayed],
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',
          'rgba(220, 53, 69, 0.7)',
          'rgba(255, 193, 7, 0.7)'
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(255, 193, 7, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Medicine Adherence'
        }
      }
    }
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // You can implement a toast notification system here
  alert(message);
}

// Add medicine form submission
medicineForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const medicineName = document.getElementById('medicine-name').value;
  const dosage = document.getElementById('dosage').value;
  const scheduleTime = document.getElementById('schedule-time').value;
  const frequency = document.getElementById('frequency').value;
  
  try {
    const response = await fetch(API.MEDICINES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: medicineName,
        dosage,
        scheduled_time: scheduleTime,
        frequency
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    medicineForm.reset();
    await fetchMedicines();
    showNotification('Medicine added successfully!');
  } catch (error) {
    console.error('Error adding medicine:', error);
    showNotification('Failed to add medicine', 'error');
  }
});

// Log intake form submission
intakeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const medicineId = medicineSelect.value;
  const intakeTime = document.getElementById('intake-time').value;
  const status = document.getElementById('status').value;
  const notes = document.getElementById('notes').value;
  
  if (!medicineId) {
    showNotification('Please select a medicine', 'warning');
    return;
  }
  
  try {
    const response = await fetch(API.MEDICINE_LOGS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        medicine_id: medicineId,
        taken_datetime: intakeTime,
        status,
        notes
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    intakeForm.reset();
    applyFiltersHandler();
    showNotification('Medicine intake logged successfully!');
  } catch (error) {
    console.error('Error logging medicine intake:', error);
    showNotification('Failed to log medicine intake', 'error');
  }
});

// Apply filters handler
function applyFiltersHandler() {
  const filters = {
    medicine_id: filterMedicine.value || null,
    status: filterStatus.value !== 'all' ? filterStatus.value : null,
    date_from: dateFrom.value,
    date_to: dateTo.value
  };
  
  // Remove null/undefined values
  Object.keys(filters).forEach(key => {
    if (filters[key] === null || filters[key] === undefined) {
      delete filters[key];
    }
  });
  
  fetchMedicineLogs(filters);
}

// Apply filters button click
applyFilters.addEventListener('click', applyFiltersHandler);

// Initialize the application
function init() {
  fetchMedicines();
  applyFiltersHandler();
}

// Start the app
init();