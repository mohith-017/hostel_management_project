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

  // Set welcome message
  document.getElementById('welcome-message').textContent = `Welcome, ${user.name} (Admin)`;

  // Add logout listener
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

  // Load all data
  fetchStats();
  fetchComplaints();
  fetchFees();
  fetchStudents();
});

// Fetch API helper
async function fetchApi(endpoint) {
  const res = await fetch(`${baseUrl}/api/admin${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return await res.json();
}

// 1. Fetch Stats
async function fetchStats() {
  try {
    const stats = await fetchApi('/stats');
    document.getElementById('stats-complaints').textContent = stats.pendingComplaints;
    document.getElementById('stats-fees').textContent = stats.pendingFees;
    document.getElementById('stats-students').textContent = stats.totalStudents;
  } catch (error) {
    console.error(error);
  }
}

// 2. Fetch Complaints (UPDATED)
async function fetchComplaints() {
  try {
    const complaints = await fetchApi('/complaints');
    const tableBody = document.getElementById('complaints-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear
    
    if (complaints.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6">No pending complaints found!</td></tr>';
      return;
    }

    complaints.forEach(c => {
      const row = tableBody.insertRow();
      
      // (NEW) Create action buttons based on status
      let actionButtons = '';
      if (c.status === 'Submitted') {
        actionButtons = `
          <button class="action-btn btn-progress" data-id="${c._id}" data-status="In Progress">Start Progress</button>
          <button class="action-btn btn-resolve" data-id="${c._id}" data-status="Resolved">Resolve</button>
        `;
      } else if (c.status === 'In Progress') {
        actionButtons = `
          <button class="action-btn btn-resolve" data-id="${c._id}" data-status="Resolved">Resolve</button>
        `;
      } else {
        actionButtons = `<button class="action-btn btn-disabled" disabled>Resolved</button>`;
      }

      row.innerHTML = `
        <td>${c.student?.name || 'N/A'}</td>
        <td>${c.student?.admissionNo || 'N/A'}</td>
        <td>${c.category}</td>
        <td>${c.description}</td>
        <td>
          <span class="status status-${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span>
        </td>
        <td>
          <div class="action-btn-group">${actionButtons}</div>
        </td>
      `;
    });

    // (NEW) Add event listeners to all action buttons
    document.querySelectorAll('.action-btn').forEach(button => {
      if (button.disabled) return; // Skip disabled buttons
      
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.dataset.status;
        updateComplaintStatus(id, newStatus);
      });
    });

  } catch (error) {
    console.error(error);
    document.getElementById('complaints-table').querySelector('tbody').innerHTML = '<tr><td colspan="6">Error loading complaints.</td></tr>';
  }
}

// 3. Fetch Fees
async function fetchFees() {
  try {
    const fees = await fetchApi('/fees');
    const tableBody = document.getElementById('fees-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear

    if (fees.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No pending fees found!</td></tr>';
      return;
    }

    fees.forEach(f => {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td>${f.student?.name || 'N/A'}</td>
        <td>${f.student?.admissionNo || 'N/A'}</td>
        <td>${f.student?.semester || 'N/A'}</td>
        <td>${f.student?.studentPhone || 'N/A'}</td>
        <td>₹${f.amount}</td>
      `;
    });
  } catch (error) {
    console.error(error);
    document.getElementById('fees-table').querySelector('tbody').innerHTML = '<tr><td colspan="5">Error loading fees.</td></tr>';
  }
}

// 4. Fetch Students
async function fetchStudents() {
  try {
    const students = await fetchApi('/students');
    const tableBody = document.getElementById('students-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear

    if (students.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7">No students found.</td></tr>';
      return;
    }

    students.forEach(s => {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td>${s.name}</td>
        <td>${s.admissionNo}</td>
        <td>${s.semester || 'N/A'}</td>
        <td>${s.studentPhone || 'N/A'}</td>
        <td>${s.parentName || 'N/A'}</td>
        <td>${s.parentPhone || 'N/A'}</td>
        <td>${s.address || 'N/A'}</td>
      `;
    });
  } catch (error) {
    console.error(error);
    document.getElementById('students-table').querySelector('tbody').innerHTML = '<tr><td colspan="7">Error loading students.</td></tr>';
  }
}

// 5. Function to update complaint status (UPDATED)
async function updateComplaintStatus(id, newStatus) {
  try {
    const res = await fetch(`${baseUrl}/api/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) throw new Error('Failed to update status');
    
    // Refresh only the complaints table for efficiency
    fetchComplaints();
    // Also refresh stats, as pending count might change
    fetchStats();
  } catch (error) {
    console.error(error);
    alert("Failed to update status.");
  }
}