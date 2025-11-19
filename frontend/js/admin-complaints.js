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

  // Load complaints data
  fetchComplaints();
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

// Fetch Complaints
async function fetchComplaints() {
  try {
    const complaints = await fetchApi('/complaints');
    const tableBody = document.getElementById('complaints-table')?.querySelector('tbody');

    if (!tableBody) {
      console.error("Complaints table body not found!");
      return;
    }

    tableBody.innerHTML = ''; // Clear previous content

    if (complaints.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6">No pending complaints found!</td></tr>';
      return;
    }

    complaints.forEach(c => {
      const row = tableBody.insertRow();

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
        <td>${c.student?.usn || 'N/A'}</td>
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

    // Add event listeners
    tableBody.querySelectorAll('.action-btn:not(:disabled)').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.dataset.status;
        if(confirm(`Are you sure you want to change status to "${newStatus}"?`)){
             updateComplaintStatus(id, newStatus);
        }
      });
    });

  } catch (error) {
    console.error("Error loading complaints:", error);
     const tableBody = document.getElementById('complaints-table')?.querySelector('tbody');
     if(tableBody) {
        tableBody.innerHTML = `<tr><td colspan="6">Error loading complaints: ${error.message}</td></tr>`;
     }
  }
}

// Function to update complaint status
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

     const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
    }

    // Refresh complaints table on success
    fetchComplaints();
    console.log("Status updated successfully!");

  } catch (error) {
    console.error("Error updating status:", error);
    alert(`Failed to update status: ${error.message}`);
  }
}