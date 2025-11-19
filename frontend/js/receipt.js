const baseUrl = "http://localhost:5000";
const token = localStorage.getItem('token');
const { jsPDF } = window.jspdf;
const html2canvas = window.html2canvas;

// --- Toast/Popper function ---
function showToast(message, type = 'error') {
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

// --- Helper function to fetch data ---
async function fetchApi(endpoint) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || `Failed to fetch ${endpoint}`);
  }
  return res.json();
}

// --- Main function to load receipt data ---
async function loadReceiptData() {
  const title = document.getElementById('receipt-title');
  const preview = document.getElementById('receipt-preview-container');
  const message = document.getElementById('receipt-message');
  const button = document.getElementById('download-receipt-btn');

  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  try {
    // Fetch both fee status and profile data in parallel
    const [feeData, profileData] = await Promise.all([
      fetchApi('/api/fees/status'),
      fetchApi('/api/users/profile')
    ]);

    if (feeData.status === 'paid') {
      title.textContent = 'Fee Receipt';
      
      // Populate the HTML preview
      document.getElementById('receipt-name').textContent = profileData.name;
      document.getElementById('receipt-usn').textContent = profileData.usn;
      document.getElementById('receipt-date').textContent = new Date(feeData.paymentDate).toLocaleDateString();
      document.getElementById('receipt-amount').textContent = `Rs. ${feeData.amount}`;

      // Show the preview and the button
      preview.classList.remove('hidden');
      button.classList.remove('hidden');

      // Add click listener to the button
      button.addEventListener('click', () => {
        // Use html2canvas to capture the "image" of the receipt preview
        html2canvas(preview).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const doc = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          doc.save(`Hostel_Fee_Receipt_${profileData.usn}.pdf`);
        });
      });

    } else {
      title.textContent = 'Receipt Not Available';
      message.textContent = 'Fee is pending. Please pay your fees to view the receipt.';
      preview.classList.add('hidden');
      button.classList.add('hidden');
    }

  } catch (error) {
    title.textContent = 'Error';
    message.textContent = `Error loading receipt data: ${error.message}`;
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadReceiptData);