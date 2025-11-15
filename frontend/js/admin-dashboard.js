const baseUrl = "http://localhost:5000";
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// (NEW) Modal Elements
const modalBackdrop = document.getElementById('student-modal-backdrop');
const modalContent = document.getElementById('student-modal-content');
const modalCloseBtn = document.getElementById('modal-close-btn');

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

  // (NEW) Add modal close listeners
  modalCloseBtn?.addEventListener('click', hideStudentModal);
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) { // Only close if clicking the backdrop itself
      hideStudentModal();
    }
  });
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
      // (UPDATED) Colspan is 7 now
      tableBody.innerHTML = '<tr><td colspan="7">No students found.</td></tr>';
      return;
    }

    students.forEach(s => {
      const row = tableBody.insertRow();
      // (UPDATED) Changed layout, added data-* attributes to button
      row.innerHTML = `
        <td>${s.name}</td>
        <td>${s.admissionNo}</td>
        <td>${s.semester || 'N/A'}</td>
        <td>${s.studentPhone || 'N/A'}</td>
        <td>${s.parentName || 'N/A'}</td>
        <td>${s.parentPhone || 'N/A'}</td>
        <td>
          <button class="action-btn btn-info" 
            data-id="${s._id}"
            data-name="${s.name}"
            data-admission-no="${s.admissionNo}"
            data-semester="${s.semester || 'N/A'}"
            data-student-phone="${s.studentPhone || 'N/A'}"
            data-parent-name="${s.parentName || 'N/A'}"
            data-parent-phone="${s.parentPhone || 'N/A'}"
            data-address="${s.address || 'N/A'}">
            View
          </button>
        </td>
      `;
    });

    // (NEW) Add event listeners for "View" buttons
    tableBody.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Read all student data from the button's data attributes
            const student = { ...e.target.dataset };
            showStudentModal(student);
        });
    });

  } catch (error) {
    console.error("Error loading students:", error);
     const tableBody = document.getElementById('students-table')?.querySelector('tbody');
     if(tableBody){
        // (UPDATED) Colspan is 7 now
        tableBody.innerHTML = `<tr><td colspan="7">Error loading students: ${error.message}</td></tr>`;
     }
  }
}

// === (NEW) MODAL FUNCTIONS ===

function showStudentModal(student) {
  if (!modalBackdrop) return;

  // 1. Populate static student details
  document.getElementById('modal-name').textContent = student.name;
  document.getElementById('modal-admission-no').textContent = student.admissionNo;
  document.getElementById('modal-semester').textContent = student.semester;
  document.getElementById('modal-student-phone').textContent = student.studentPhone;
  document.getElementById('modal-parent-name').textContent = student.parentName;
  document.getElementById('modal-parent-phone').textContent = student.parentPhone;
  document.getElementById('modal-address').textContent = student.address;

  // 2. Set loading state for dynamic content
  document.getElementById('modal-fee-status').innerHTML = '<p>Loading fee status...</p>';
  document.getElementById('modal-complaints-list').innerHTML = '<p>Loading complaints...</p>';

  // 3. Fetch dynamic content
  fetchStudentFee(student.id);
  fetchStudentComplaints(student.id);

  // 4. Show the modal
  modalBackdrop.classList.remove('hidden');
}

function hideStudentModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.add('hidden');
}

// (NEW) Fetch fee status for one student
async function fetchStudentFee(studentId) {
  const feeContainer = document.getElementById('modal-fee-status');
  try {
    const fee = await fetchApi(`/student/${studentId}/fees`);
    
    if (fee.status === 'paid') {
      feeContainer.innerHTML = `<p class="modal-fee-paid">PAID</p>`;
    } else {
      feeContainer.innerHTML = `<p class="modal-fee-pending">PENDING (₹${fee.amount})</p>`;
    }
  } catch (error) {
    feeContainer.innerHTML = `<p>${error.message}</p>`;
  }
}

// (NEW) Fetch complaints for one student
async function fetchStudentComplaints(studentId) {
  const complaintsContainer = document.getElementById('modal-complaints-list');
  try {
    const complaints = await fetchApi(`/student/${studentId}/complaints`);

    if (complaints.length === 0) {
      complaintsContainer.innerHTML = '<p>No pending complaints found.</p>';
      return;
    }

    complaintsContainer.innerHTML = ''; // Clear loading
    complaints.forEach(c => {
      const item = document.createElement('div');
      item.className = 'modal-complaint-item';
      item.innerHTML = `
        <span class="status status-${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span>
        <strong>${c.category}</strong>
        <p>${c.description}</p>
      `;
      complaintsContainer.appendChild(item);
    });

  } catch (error) {
    complaintsContainer.innerHTML = `<p>Error loading complaints: ${error.message}</p>`;
  }
}

// (REMOVED) updateStudentPhone function is no longer needed.