const baseUrl = "http://localhost:5000";

function toggleForm() {
  document.getElementById("login-section").classList.toggle("hidden");
  document.getElementById("signup-section").classList.toggle("hidden");
  document.getElementById("message").innerText = "";
}

async function signup() {
  const admno = document.getElementById("signup-admno").value.trim();
  const role = document.getElementById("signup-role").value;
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signup-confirm").value.trim();

  if (!admno || !password || !confirm)
    return showMessage("All fields are required!");

  if (password !== confirm)
    return showMessage("Passwords do not match!");

  const res = await fetch(`${baseUrl}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admissionNo: admno, password, role }),
  });

  const data = await res.json();
  
  if (res.ok) {
    showMessage("Registration successful! Please log in.", "success");
    toggleForm();
  } else {
    showMessage(data.error || "An error occurred.");
  }
}

async function login() {
  const admno = document.getElementById("login-admno").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!admno || !password)
    return showMessage("Both fields are required!");

  const res = await fetch(`${baseUrl}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admissionNo: admno, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('token', data.token);
    window.location.href = "rooms.html";
  } else {
    showMessage(data.error || "Login failed!");
  }
}

function showMessage(msg, type = "error") {
  const messageEl = document.getElementById("message");
  messageEl.innerText = msg;
  messageEl.style.color = type === "success" ? "#28a745" : "#d9534f";
}