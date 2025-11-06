const baseUrl = "http://localhost:5000";
const token = localStorage.getItem('token');

// Elements
const profileName = document.getElementById('profile-name');
const profileAdmissionNo = document.getElementById('profile-admissionNo');
const studentPhoneInput = document.getElementById('profile-student-phone');
const parentNameInput = document.getElementById('profile-parent-name');
const parentPhoneInput = document.getElementById('profile-parent-phone');
const addressInput = document.getElementById('profile-address');
const saveButton = document.getElementById('save-profile-btn');

// --- Toast/Popper function (from your rooms.js) ---
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}
// --- End Toast Function ---

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  fetchProfile();
  saveButton.addEventListener('click', updateProfile);
});

async function fetchProfile() {
  try {
    const res = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not fetch profile');

    // Populate the form
    profileName.textContent = data.name;
    profileAdmissionNo.textContent = data.admissionNo;
    studentPhoneInput.value = data.studentPhone || '';
    parentNameInput.value = data.parentName || '';
    parentPhoneInput.value = data.parentPhone || '';
    addressInput.value = data.address || '';

  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function updateProfile() {
  const updatedData = {
    studentPhone: studentPhoneInput.value,
    parentName: parentNameInput.value,
    parentPhone: parentPhoneInput.value,
    address: addressInput.value,
  };

  try {
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    const res = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');

    showToast('Profile updated successfully!', 'success');
  
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Save Changes';
  }
}