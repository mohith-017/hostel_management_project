const baseUrl = "http://localhost:5000";
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

document.addEventListener('DOMContentLoaded', () => {
  // Security checks
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  if (!user || user.role !== 'admin') {
    alert("You are not authorized to view this page.");
    window.location.href = 'dashboard.html';
    return;
  }

  // Add logout listener
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

  // Load fees data
  fetchFees();
});

// Fetch API helper
async function fetchApi(endpoint) {
  const res = await fetch(`${baseUrl}/api/admin${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
     const errorData = await res.json();
     throw new Error(errorData.error || `Failed to fetch ${endpoint} (${res.status})`);
  }
  return await res.json();
}

// Fetch Fees
async function fetchFees() {
  try {
    const fees = await fetchApi('/fees');
    const tableBody = document.getElementById('fees-table')?.querySelector('tbody');
     if (!tableBody) return; 

    tableBody.innerHTML = ''; // Clear

    if (fees.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No pending fees found!</td></tr>';
      return;
    }

    fees.forEach(f => {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td>${f.student?.name || 'N/A'}</td>
        <td>${f.student?.usn || 'N/A'}</td>
        <td>${f.student?.semester || 'N/A'}</td>
        <td>${f.student?.studentPhone || 'N/A'}</td>
        <td>₹${f.amount}</td>
      `;
    });
  } catch (error) {
    console.error("Error loading fees:", error);
     const tableBody = document.getElementById('fees-table')?.querySelector('tbody');
     if(tableBody){
        tableBody.innerHTML = `<tr><td colspan="5">Error loading fees: ${error.message}</td></tr>`;
     }
  }
}