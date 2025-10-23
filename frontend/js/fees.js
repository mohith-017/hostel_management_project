const baseUrl = "http://localhost:5000";
const token = localStorage.getItem('token');

// Elements
const feeMessage = document.getElementById('fee-message');
const feeDetails = document.getElementById('fee-details');
const feeAmount = document.getElementById('fee-amount');
const feeStatus = document.getElementById('fee-status');
const paymentDate = document.getElementById('payment-date');
const payButton = document.getElementById('pay-button');
const apiMessage = document.getElementById('api-message');

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  fetchFeeStatus();
  payButton.addEventListener('click', payFee);
});

async function fetchFeeStatus() {
  try {
    const res = await fetch(`${baseUrl}/api/fees/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Could not fetch fee status');
    
    const fee = await res.json();
    displayFeeStatus(fee);

  } catch (error) {
    feeMessage.textContent = `Error: ${error.message}`;
    feeMessage.style.color = '#e74c3c';
  }
}

function displayFeeStatus(fee) {
  feeMessage.classList.add('hidden');
  feeDetails.classList.remove('hidden');

  feeAmount.textContent = `₹${fee.amount}`;
  feeStatus.textContent = fee.status.charAt(0).toUpperCase() + fee.status.slice(1); // Capitalize

  if (fee.status === 'paid') {
    feeStatus.style.color = '#2ecc71';
    payButton.classList.add('hidden');
    paymentDate.textContent = `Paid on: ${new Date(fee.paymentDate).toLocaleDateString()}`;
  } else {
    feeStatus.style.color = '#e74c3c';
    payButton.classList.remove('hidden');
    paymentDate.textContent = '';
  }
}

async function payFee() {
  if (!confirm("Confirm payment? This is a simulation.")) return;

  try {
    payButton.disabled = true;
    apiMessage.textContent = 'Processing payment...';

    const res = await fetch(`${baseUrl}/api/fees/pay`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Payment failed');
    
    apiMessage.textContent = data.message;
    apiMessage.style.color = '#2ecc71';
    displayFeeStatus(data.fee); // Update UI with new status

  } catch (error) {
    apiMessage.textContent = `Error: ${error.message}`;
    apiMessage.style.color = '#e74c3c';
    payButton.disabled = false;
  }
}