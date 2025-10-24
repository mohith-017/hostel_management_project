const baseUrl = "http://localhost:5000";

document.addEventListener('DOMContentLoaded', () => {
  const signupRole = document.getElementById('signup-role');
  if (signupRole) {
    signupRole.addEventListener('change', handleRoleChange);
  }
});

function handleRoleChange() {
  const role = document.getElementById('signup-role').value;
  const studentFields = document.getElementById('student-fields');
  const adminFields = document.getElementById('admin-fields');

  if (role === 'student') {
    studentFields.classList.remove('hidden');
    adminFields.classList.add('hidden');
  } else {
    studentFields.classList.add('hidden');
    adminFields.classList.remove('hidden');
  }
}

function toggleForm() {
  document.getElementById("login-section").classList.toggle("hidden");
  document.getElementById("signup-section").classList.toggle("hidden");
  document.getElementById("message").innerText = "";
  handleRoleChange(); // Ensure correct fields are shown on toggle
}

async function signup() {
  const name = document.getElementById('signup-name').value.trim();
  const admissionNo = document.getElementById('signup-id').value.trim();
  const role = document.getElementById('signup-role').value;
  const password = document.getElementById('signup-password').value.trim();
  const confirm = document.getElementById('signup-confirm').value.trim();
  
  const userData = { name, admissionNo, role, password };

  if (role === 'student') {
    userData.semester = document.getElementById('signup-semester').value.trim();
  } else {
    userData.post = document.getElementById('signup-post').value.trim();
  }

  if (password !== confirm) return showMessage("Passwords do not match!");

  try {
    const res = await fetch(`${baseUrl}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    
    showMessage('Registration successful! Please log in.', 'success');
    toggleForm();
  } catch (error) {
    showMessage(error.message);
  }
}

async function login() {
  const admissionNo = document.getElementById('login-id').value.trim();
  const role = document.getElementById('login-role').value;
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionNo, role, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Save user info

    // --- (UPDATED) ---
    // Redirect based on role
    if (data.user.role === 'student') {
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'rooms.html'; // Admin can still see the rooms for now
    }
    // --- (END OF UPDATE) ---

  } catch (error) {
    showMessage(error.message);
  }
}

function showMessage(msg, type = 'error') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  messageEl.style.color = type === 'success' ? '#2ecc71' : '#e74c3c';
}

// ... (keep handleRoleChange, toggleForm, and showMessage) ...

async function signup() {
  const name = document.getElementById('signup-name').value.trim();
  const admissionNo = document.getElementById('signup-id').value.trim();
  const role = document.getElementById('signup-role').value;
  const password = document.getElementById('signup-password').value.trim();
  const confirm = document.getElementById('signup-confirm').value.trim();
  
  // (UPDATED) Get all new fields
  const userData = { name, admissionNo, role, password };

  if (role === 'student') {
    userData.semester = document.getElementById('signup-semester').value.trim();
    userData.studentPhone = document.getElementById('signup-student-phone').value.trim();
    userData.parentName = document.getElementById('signup-parent-name').value.trim();
    userData.parentPhone = document.getElementById('signup-parent-phone').value.trim();
    userData.address = document.getElementById('signup-address').value.trim();
  } else {
    userData.post = document.getElementById('signup-post').value.trim();
  }

  if (password !== confirm) return showMessage("Passwords do not match!");

  try {
    const res = await fetch(`${baseUrl}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData), // (Body now includes all new data)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    
    showMessage('Registration successful! Please log in.', 'success');
    toggleForm();
  } catch (error) {
    showMessage(error.message);
  }
}

async function login() {
  const admissionNo = document.getElementById('login-id').value.trim();
  const role = document.getElementById('login-role').value;
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionNo, role, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Save user info

    // (UPDATED) Redirect admin to new dashboard
    if (data.user.role === 'student') {
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'admin-dashboard.html'; // (NEW)
    }

  } catch (error) {
    showMessage(error.message);
  }
}

// ... (keep baseUrl, event listener) ...

function handleRoleChange() {
  const role = document.getElementById('signup-role').value;
  const studentFields = document.getElementById('student-fields');
  const adminFields = document.getElementById('admin-fields');

  if (role === 'student') {
    studentFields.classList.remove('is-hidden'); // Use Bulma class
    adminFields.classList.add('is-hidden');     // Use Bulma class
  } else {
    studentFields.classList.add('is-hidden');     // Use Bulma class
    adminFields.classList.remove('is-hidden'); // Use Bulma class
  }
}

function toggleForm() {
  document.getElementById("login-section").classList.toggle("is-hidden"); // Use Bulma class
  document.getElementById("signup-section").classList.toggle("is-hidden");// Use Bulma class
  // Clear message
  const messageEl = document.getElementById('message');
  messageEl.textContent = '';
  messageEl.className = 'notification mt-4'; // Reset classes
  handleRoleChange(); 
}

// ... (keep signup function) ...
// ... (keep login function) ...

function showMessage(msg, type = 'error') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  // Use Bulma notification classes
  messageEl.className = `notification mt-4 ${type === 'success' ? 'is-success' : 'is-danger'}`;
}

function showMessage(msg, type = 'error') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  // Use custom classes for styling
  messageEl.className = ` ${type}`; // Add 'success' or 'error' class
}