// API base URL - change this to your actual backend URL when deployed
const API_BASE_URL = 'http://localhost:4000';

// DOM Elements
const registerForm = document.getElementById('registerForm');
const registerResult = document.getElementById('registerResult');
const viewForm = document.getElementById('viewForm');
const viewResult = document.getElementById('viewResult');
const patientInfo = document.getElementById('patientInfo');
const patientData = document.getElementById('patientData');
const getAllPatientsBtn = document.getElementById('getAllPatients');
const allPatientsResult = document.getElementById('allPatientsResult');
const probabilityForm = document.getElementById('probabilityForm');
const probabilityResult = document.getElementById('probabilityResult');
const slot1Bar = document.getElementById('slot1Bar');
const slot2Bar = document.getElementById('slot2Bar');
const slot3Bar = document.getElementById('slot3Bar');
const slot1Prob = document.getElementById('slot1Prob');
const slot2Prob = document.getElementById('slot2Prob');
const slot3Prob = document.getElementById('slot3Prob');

// Event Listeners
registerForm.addEventListener('submit', handleRegisterSubmit);
viewForm.addEventListener('submit', handleViewSubmit);
getAllPatientsBtn.addEventListener('click', handleGetAllPatients);
probabilityForm.addEventListener('submit', handleProbabilitySubmit);

// Handle form submissions
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        patient_id: parseInt(document.getElementById('patient_id').value),
        medicine_taken: document.getElementById('medicine_taken').value === 'true',
        slot: parseInt(document.getElementById('slot').value)
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/patient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            registerResult.innerHTML = `
                <div class="success-message">
                    ${data.message}
                </div>
            `;
            registerForm.reset();
        } else {
            registerResult.innerHTML = `
                <div class="error-message">
                    Error: ${data.message || 'Failed to register patient'}
                </div>
            `;
        }
    } catch (error) {
        registerResult.innerHTML = `
            <div class="error-message">
                Error: ${error.message}
            </div>
        `;
    }
}

async function handleViewSubmit(e) {
    e.preventDefault();
    
    const patientId = document.getElementById('viewPatientId').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/patient/${patientId}`);
        const data = await response.json();
        
        if (response.ok && data.length > 0) {
            const patient = data[0];
            patientInfo.innerHTML = `
                <h3>Patient: ${patient.name}</h3>
                <p>ID: ${patient.patient_id}</p>
            `;
            
            let tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Slot</th>
                            <th>Medicine Taken</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            patient.data.forEach(entry => {
                const date = new Date(entry.time).toLocaleString();
                tableHTML += `
                    <tr>
                        <td>${date || 'N/A'}</td>
                        <td>${getSlotName(entry.slot)}</td>
                        <td>${entry.medicine_taken ? 'Yes' : 'No'}</td>
                    </tr>
                `;
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            
            patientData.innerHTML = tableHTML;
        } else {
            patientInfo.innerHTML = '';
            patientData.innerHTML = `
                <div class="error-message">
                    No patient found with ID: ${patientId}
                </div>
            `;
        }
    } catch (error) {
        patientInfo.innerHTML = '';
        patientData.innerHTML = `
            <div class="error-message">
                Error: ${error.message}
            </div>
        `;
    }
}

async function handleGetAllPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/patient`);
        const data = await response.json();
        
        if (response.ok) {
            if (data.length === 0) {
                allPatientsResult.innerHTML = `<p>No patients found in the database.</p>`;
                return;
            }
            
            // Group patients by patient_id
            const patientsMap = {};
            
            data.forEach(entry => {
                if (!patientsMap[entry.patient_id]) {
                    patientsMap[entry.patient_id] = {
                        name: entry.name,
                        entries: []
                    };
                }
                
                patientsMap[entry.patient_id].entries.push({
                    time: entry.time,
                    slot: entry.slot,
                    medicine_taken: entry.medicine_taken
                });
            });
            
            let html = '';
            for (const [patientId, patient] of Object.entries(patientsMap)) {
                html += `
                    <div class="patient-card">
                        <h3>${patient.name}</h3>
                        <p>Patient ID: ${patientId}</p>
                        <p>Total Records: ${patient.entries.length}</p>
                        <button onclick="viewPatient(${patientId})">View Details</button>
                    </div>
                `;
            }
            
            allPatientsResult.innerHTML = html;
        } else {
            allPatientsResult.innerHTML = `
                <div class="error-message">
                    Error: Failed to retrieve patients
                </div>
            `;
        }
    } catch (error) {
        allPatientsResult.innerHTML = `
            <div class="error-message">
                Error: ${error.message}
            </div>
        `;
    }
}

async function handleProbabilitySubmit(e) {
    e.preventDefault();
    
    const patientId = document.getElementById('probPatientId').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/patient/probability/${patientId}`);
        const data = await response.json();
        
        if (response.ok) {
            // Update the probability chart
            updateProbabilityChart(data);
        } else {
            probabilityResult.innerHTML = `
                <div class="error-message">
                    Error: ${data.message || 'Failed to retrieve probability data'}
                </div>
            `;
        }
    } catch (error) {
        probabilityResult.innerHTML = `
            <div class="error-message">
                Error: ${error.message}
            </div>
        `;
    }
}

// Helper functions
function getSlotName(slotNumber) {
    switch(slotNumber) {
        case 1: return 'Morning (1)';
        case 2: return 'Afternoon (2)';
        case 3: return 'Evening (3)';
        default: return `Slot ${slotNumber}`;
    }
}

function updateProbabilityChart(data) {
    // Update the bars
    slot1Bar.style.width = `${data.Slot1}%`;
    slot2Bar.style.width = `${data.Slot2}%`;
    slot3Bar.style.width = `${data.Slot3}%`;
    
    // Update the text
    slot1Prob.textContent = `${data.Slot1}%`;
    slot2Prob.textContent = `${data.Slot2}%`;
    slot3Prob.textContent = `${data.Slot3}%`;
}

// Function to view a specific patient (called from all patients view)
function viewPatient(patientId) {
    document.getElementById('viewPatientId').value = patientId;
    document.getElementById('view').scrollIntoView({ behavior: 'smooth' });
    viewForm.dispatchEvent(new Event('submit'));
} 