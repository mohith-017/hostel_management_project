// Basic security check and user personalization
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html'; // Redirect to login if not authenticated
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.name) {
    document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
});