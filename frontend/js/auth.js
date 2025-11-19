const baseUrl = "http://localhost:5000";

document.addEventListener('DOMContentLoaded', () => {
  // Add listener only if the element exists (prevents errors on other pages)
  const signupRoleSelect = document.getElementById('signup-role');
  if (signupRoleSelect) {
    signupRoleSelect.addEventListener('change', handleRoleChange);
    // Initial call to set the correct fields visibility on page load
    handleRoleChange();
  }
});

function handleRoleChange() {
  // Ensure elements exist before trying to access them
  const roleSelect = document.getElementById('signup-role');
  const studentFields = document.getElementById('student-fields');
  const adminFields = document.getElementById('admin-fields');

  if (!roleSelect || !studentFields || !adminFields) return; // Exit if elements aren't found

  const role = roleSelect.value;

  if (role === 'student') {
    studentFields.classList.remove('hidden'); // Use custom 'hidden' class
    adminFields.classList.add('hidden');     // Use custom 'hidden' class
  } else {
    studentFields.classList.add('hidden');     // Use custom 'hidden' class
    adminFields.classList.remove('hidden'); // Use custom 'hidden' class
  }
}

function toggleForm() {
  const loginSection = document.getElementById("login-section");
  const signupSection = document.getElementById("signup-section");
  const messageEl = document.getElementById("message");

  if (loginSection && signupSection) {
      loginSection.classList.toggle("hidden"); // Use custom 'hidden' class
      signupSection.classList.toggle("hidden");// Use custom 'hidden' class
  }
  if (messageEl) {
      messageEl.textContent = '';        // Clear message text
      messageEl.className = '';          // Clear message classes (like success/error)
      messageEl.style.display = 'none'; // Ensure it's hidden
  }
  handleRoleChange(); // Update field visibility when toggling
}

// Corrected signup function - gathers all fields
async function signup() {
  // Ensure all elements exist before getting values
  const nameInput = document.getElementById('signup-name');
  const usnInput = document.getElementById('signup-usn');
  const roleSelect = document.getElementById('signup-role');
  const passwordInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-confirm');
  const semesterInput = document.getElementById('signup-semester');
  const studentPhoneInput = document.getElementById('signup-student-phone');
  const parentNameInput = document.getElementById('signup-parent-name');
  const parentPhoneInput = document.getElementById('signup-parent-phone');
  const addressInput = document.getElementById('signup-address');
  const postInput = document.getElementById('signup-post');

  if (!nameInput || !usnInput || !roleSelect || !passwordInput || !confirmInput) {
      showMessage("Form elements missing. Please check HTML.", 'error');
      return;
  }

  const name = nameInput.value.trim();
  const usn = usnInput.value.trim();
  const role = roleSelect.value;
  const password = passwordInput.value.trim();
  const confirm = confirmInput.value.trim();

  // Basic validation
  if (!name || !usn || !role || !password || !confirm) {
       return showMessage("Please fill all required fields.", 'error');
  }
  if (password !== confirm) return showMessage("Passwords do not match!", 'error');

  const userData = { name, usn, role, password };

  if (role === 'student') {
    if (!semesterInput || !studentPhoneInput || !parentNameInput || !parentPhoneInput || !addressInput) {
        showMessage("Student specific form elements missing.", 'error'); return;
    }
    userData.semester = semesterInput.value.trim();
    userData.studentPhone = studentPhoneInput.value.trim();
    userData.parentName = parentNameInput.value.trim();
    userData.parentPhone = parentPhoneInput.value.trim();
    userData.address = addressInput.value.trim();
     // Add validation for student fields if needed
     if (!userData.semester || !userData.studentPhone || !userData.parentName || !userData.parentPhone || !userData.address) {
          return showMessage("Please fill all student details.", 'error');
     }
  } else { // role === 'admin'
    if (!postInput) {
         showMessage("Admin specific form elements missing.", 'error'); return;
    }
    userData.post = postInput.value.trim();
     // Add validation for admin fields if needed
     if (!userData.post) {
          return showMessage("Please fill the admin post field.", 'error');
     }
  }


  try {
    const signupButton = document.querySelector('#signup-section button');
    if(signupButton) signupButton.disabled = true; // Disable button during request

    const res = await fetch(`${baseUrl}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
        // Use backend error message if available
        throw new Error(data.error || `Registration failed (${res.status})`);
    }

    showMessage('Registration successful! Please log in.', 'success');
    toggleForm(); // Switch back to login form
  } catch (error) {
    showMessage(error.message || "An unexpected error occurred.", 'error');
  } finally {
      const signupButton = document.querySelector('#signup-section button');
      if(signupButton) signupButton.disabled = false; // Re-enable button
  }
}

// Corrected login function - redirects admin correctly
async function login() {
  const usnInput = document.getElementById('login-usn');
  const roleSelect = document.getElementById('login-role');
  const passwordInput = document.getElementById('login-password');

  if (!usnInput || !roleSelect || !passwordInput) {
      showMessage("Login form elements missing. Please check HTML.", 'error');
      return;
  }

  const usn = usnInput.value.trim();
  const role = roleSelect.value;
  const password = passwordInput.value.trim();

  if (!usn || !password) {
      return showMessage("USN and Password are required.", 'error');
  }

  try {
     const loginButton = document.querySelector('#login-section button');
     if(loginButton) loginButton.disabled = true; // Disable button

    const res = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usn, role, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `Login failed (${res.status})`);
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Save user info

    // Redirect admin to admin-dashboard, student to dashboard
    if (data.user.role === 'student') {
      window.location.href = 'dashboard.html';
    } else if (data.user.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
        // Fallback or error if role is unexpected
        showMessage("Logged in with unknown role.", 'error');
    }

  } catch (error) {
    showMessage(error.message || "An unexpected error occurred during login.", 'error');
     const loginButton = document.querySelector('#login-section button');
     if(loginButton) loginButton.disabled = false; // Re-enable button on error
  }
}

// Corrected showMessage function - uses classes for frosted style
function showMessage(msg, type = 'error') {
  const messageEl = document.getElementById('message');
  if (!messageEl) return; // Exit if message element doesn't exist

  messageEl.textContent = msg;
  // Use custom classes for styling matching style.css
  messageEl.className = type; // Adds 'success' or 'error' class
  messageEl.style.display = 'block'; // Make it visible
}