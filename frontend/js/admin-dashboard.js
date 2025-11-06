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

  // Load stats AND student data
  fetchStats();
  fetchStudents();
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

// 1. Fetch Stats (No Change)
async function fetchStats() {
  try {
    const stats = await fetchApi('/stats');
    document.getElementById('stats-complaints').textContent = stats.pendingComplaints;
    document.getElementById('stats-fees').textContent = stats.pendingFees;
    document.getElementById('stats-students').textContent = stats.totalStudents;
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}

// 2. Fetch Students (FUNCTION UPDATED)
async function fetchStudents() {
  try {
    const students = await fetchApi('/students');
    const tableBody = document.getElementById('students-table')?.querySelector('tbody');
     if (!tableBody) return; // Check if element exists

    tableBody.innerHTML = ''; // Clear

    if (students.length === 0) {
      // (UPDATED) Colspan is 8 now
      tableBody.innerHTML = '<tr><td colspan="8">No students found.</td></tr>';
      return;
    }

    students.forEach(s => {
      const row = tableBody.insertRow();
      // (UPDATED) Added new <td> for button
      row.innerHTML = `
        <td>${s.name}</td>
        <td>${s.admissionNo}</td>
        <td>${s.semester || 'N/A'}</td>
        <td>${s.studentPhone || 'N/A'}</td>
        <td>${s.parentName || 'N/A'}</td>
        <td>${s.parentPhone || 'N/A'}</td>
        <td>${s.address || 'N/A'}</td>
        <td>
          <button class="action-btn btn-progress" data-id="${s._id}" data-phone="${s.studentPhone || ''}">
            Edit Phone
          </button>
        </td>
      `;
    });

    // (NEW) Add event listeners for edit buttons
    tableBody.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const currentPhone = e.target.dataset.phone;
            
            const newPhone = prompt("Enter new phone number for this student:", currentPhone);
            
            if (newPhone && newPhone !== currentPhone) {
                updateStudentPhone(id, newPhone);
            }
        });
    });

  } catch (error) {
    console.error("Error loading students:", error);
     const tableBody = document.getElementById('students-table')?.querySelector('tbody');
     if(tableBody){
        // (UPDATED) Colspan is 8 now
        tableBody.innerHTML = `<tr><td colspan="8">Error loading students: ${error.message}</td></tr>`;
     }
  }
}

// (NEW FUNCTION)
async function updateStudentPhone(id, studentPhone) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ studentPhone }) // Only send the field to update
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to update student');
        }

        alert("Student phone number updated successfully!");
        fetchStudents(); // Refresh the table
        
    } catch (error) {
        alert(`Update Error: ${error.message}`);
    }
}