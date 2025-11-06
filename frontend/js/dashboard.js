const baseUrl = "http://localhost:5000"; // Define baseUrl here

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

  // Fetch and display room details
  fetchMyRoomDetails();
  // (NEW) Fetch announcements
  fetchAnnouncements(); 
});

// Fetch My Room Details
async function fetchMyRoomDetails() {
    const token = localStorage.getItem('token');
    const roomDetailsContent = document.getElementById('room-details-content');

    if (!token) return; // Should already be handled by DOMContentLoaded check

    try {
        const res = await fetch(`${baseUrl}/api/users/my-room`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 404) {
             // Handle case where user hasn't booked a room
             const data = await res.json();
             roomDetailsContent.innerHTML = `<p class="no-room-message">${data.message || 'You have not booked a room yet.'}</p>`;
             return;
        }

        if (!res.ok) {
            // Handle other errors
            throw new Error('Could not fetch room details.');
        }

        const roomData = await res.json();

        // Display the room details
        roomDetailsContent.innerHTML = `
            <p>You are currently booked in:</p>
            <p><strong>Room:</strong> <span class="room-highlight">${roomData.roomNumber}</span></p>
            <p><strong>Bed:</strong> <span class="room-highlight">${roomData.bedNumber}</span></p>
        `;

    } catch (error) {
        console.error("Error fetching room details:", error);
        roomDetailsContent.innerHTML = `<p style="color: red;">Error loading room details.</p>`;
    }
}

// (NEW FUNCTION) Fetch Announcements
async function fetchAnnouncements() {
    const token = localStorage.getItem('token');
    const listContainer = document.getElementById('announcements-list');
    if (!token || !listContainer) return;

    try {
        const res = await fetch(`${baseUrl}/api/announcements`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const announcements = await res.json();
        if (!res.ok) throw new Error(announcements.error || 'Failed to fetch');

        if (announcements.length === 0) {
            listContainer.innerHTML = '<p>No announcements at this time.</p>';
            return;
        }

        listContainer.innerHTML = ''; // Clear loading
        announcements.forEach(a => {
            const item = document.createElement('div');
            item.className = 'announcement-item';
            item.innerHTML = `
                <h3>${a.title}</h3>
                <p>${a.content}</p>
                <small>Posted: ${new Date(a.createdAt).toLocaleDateString()}</small>
            `;
            listContainer.appendChild(item);
        });

    } catch (error) {
        listContainer.innerHTML = `<p style="color: red;">Error loading announcements.</p>`;
    }
}