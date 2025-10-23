const baseUrl = "http://localhost:5000";
const token = localStorage.getItem('token');

// Elements
const categorySelect = document.getElementById('complaint-category');
const descriptionInput = document.getElementById('complaint-desc');
const submitButton = document.getElementById('submit-complaint-btn');
const apiMessage = document.getElementById('complaint-api-message');
const complaintsList = document.getElementById('complaints-list');

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  fetchMyComplaints();
  submitButton.addEventListener('click', submitComplaint);
});

async function submitComplaint() {
  const category = categorySelect.value;
  const description = descriptionInput.value.trim();

  if (!category || !description) {
    apiMessage.textContent = 'Please select a category and add a description.';
    apiMessage.style.color = '#e74c3c';
    return;
  }

  try {
    submitButton.disabled = true;
    apiMessage.textContent = 'Submitting...';

    const res = await fetch(`${baseUrl}/api/complaints/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ category, description })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to submit');

    apiMessage.textContent = data.message;
    apiMessage.style.color = '#2ecc71';
    
    // Clear form and refresh list
    categorySelect.value = '';
    descriptionInput.value = '';
    fetchMyComplaints();

  } catch (error) {
    apiMessage.textContent = `Error: ${error.message}`;
    apiMessage.style.color = '#e74c3c';
  } finally {
    submitButton.disabled = false;
  }
}

async function fetchMyComplaints() {
  try {
    complaintsList.innerHTML = '<p>Loading your complaints...</p>';
    const res = await fetch(`${baseUrl}/api/complaints/my-complaints`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Could not fetch complaints');

    const complaints = await res.json();

    if (complaints.length === 0) {
      complaintsList.innerHTML = '<p>You have not submitted any complaints yet.</p>';
      return;
    }

    complaintsList.innerHTML = ''; // Clear loading message
    complaints.forEach(c => {
      const complaintItem = document.createElement('div');
      complaintItem.className = 'complaint-item';
      complaintItem.innerHTML = `
        <div class="complaint-header">
          <strong>${c.category}</strong>
          <span class="status status-${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span>
        </div>
        <p>${c.description}</p>
        <small>Submitted on: ${new Date(c.createdAt).toLocaleString()}</small>
      `;
      complaintsList.appendChild(complaintItem);
    });

  } catch (error) {
    complaintsList.innerHTML = `<p style="color: #e74c3c;">Error: ${error.message}</p>`;
  }
}