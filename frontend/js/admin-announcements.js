const baseUrl = "http://localhost:5000";
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Elements
const createBtn = document.getElementById('create-btn');
const titleInput = document.getElementById('announcement-title');
const contentInput = document.getElementById('announcement-content');
const listContainer = document.getElementById('announcements-list-container');

document.addEventListener('DOMContentLoaded', () => {
  // Security checks
  if (!token || !user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }
  
  // Add logout listener
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

  // Load data
  fetchAnnouncements();

  // Add create listener
  createBtn.addEventListener('click', createAnnouncement);
});

async function fetchAnnouncements() {
  try {
    const res = await fetch(`${baseUrl}/api/announcements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const announcements = await res.json();
    if (!res.ok) throw new Error(announcements.error || 'Failed to fetch');

    listContainer.innerHTML = ''; // Clear loading
    if (announcements.length === 0) {
      listContainer.innerHTML = '<p>No announcements found.</p>';
      return;
    }

    announcements.forEach(a => {
      const item = document.createElement('div');
      item.className = 'announcement-item-admin';
      item.innerHTML = `
        <div class="announcement-header">
            <h3>${a.title}</h3>
            <button class="action-btn" style="background-color: #ef4444; border-radius: 5px;" data-id="${a._id}">Delete</button>
        </div>
        <p>${a.content}</p>
        <small>Posted by: ${a.author.name} on ${new Date(a.createdAt).toLocaleDateString()}</small>
      `;
      listContainer.appendChild(item);
    });

    // Add delete listeners
    listContainer.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteAnnouncement(btn.dataset.id));
    });

  } catch (error) {
    listContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

async function createAnnouncement() {
  const title = titleInput.value;
  const content = contentInput.value;
  if (!title || !content) {
    alert("Please fill in both title and content.");
    return;
  }
  
  try {
    createBtn.disabled = true;
    const res = await fetch(`${baseUrl}/api/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create');
    
    // Clear form and refresh list
    titleInput.value = '';
    contentInput.value = '';
    fetchAnnouncements();

  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    createBtn.disabled = false;
  }
}

async function deleteAnnouncement(id) {
  if (!confirm("Are you sure you want to delete this announcement?")) return;
  
  try {
    const res = await fetch(`${baseUrl}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    
    fetchAnnouncements(); // Refresh list
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}