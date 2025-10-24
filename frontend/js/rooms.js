const baseUrl = "http://localhost:5000";
const findRoomsBtn = document.getElementById("find-rooms-btn");
const viewContainer = document.getElementById("view-container");
const token = localStorage.getItem('token');

// Initial check for token
if (!token) {
  window.location.href = 'index.html';
}

findRoomsBtn?.addEventListener("click", fetchAndShowRooms);

// --- Toast/Popper function (Keep As Is) ---
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


// --- Fetch and Show Rooms List ---
async function fetchAndShowRooms() {
    const blockSelect = document.getElementById("block-select");
    const floorSelect = document.getElementById("floor-select");

    if (!blockSelect || !floorSelect || !viewContainer) {
        console.error("Required elements not found in rooms.html");
        return;
    }

    const block = blockSelect.value;
    const floor = floorSelect.value;

    // Preserve selection for when returning from bed view
    const currentBlock = blockSelect.value;
    const currentFloor = floorSelect.value;

    viewContainer.innerHTML = '<p>Loading rooms...</p>';

    if (!block || !floor) {
        viewContainer.innerHTML = `<p>Please select a block and a floor to begin.</p>`;
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/api/rooms/query?block=${block}&floor=${floor}`);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Could not fetch rooms.');
        }

        const rooms = await res.json();
        viewContainer.innerHTML = ""; // Clear

        if (rooms.length === 0) {
            viewContainer.innerHTML = `<p>No rooms found for Block ${block}, Floor ${floor}.</p>`;
            return;
        }

        rooms.forEach(room => {
            const roomBox = document.createElement("div");
            roomBox.className = "room-box";
            roomBox.innerHTML = `<h3>${room.roomNumber}</h3>`;
             // Pass current selection to showBedLayout if needed later
            roomBox.onclick = () => showBedLayout(room, currentBlock, currentFloor);
            viewContainer.appendChild(roomBox);
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        viewContainer.innerHTML = `<p style="color: var(--error-color);">Error: ${error.message}</p>`;
    }
}

// --- Show Bed Layout --- (UPDATED CLASS LOGIC)
// Added block/floor params to remember selection when going back
function showBedLayout(room, originalBlock, originalFloor) {
    if (!viewContainer) return;

    viewContainer.innerHTML = `
        <div class="bed-layout-box">
            <h2>Room: ${room.roomNumber}</h2>
            <div class="beds-layout">
                </div>
            <button id="back-to-rooms-btn">← Back to Room List</button>
        </div>
    `;

    const bedsLayoutContainer = viewContainer.querySelector(".beds-layout");
    if (!bedsLayoutContainer) return;

    room.beds.forEach(bed => {
        const bedItem = document.createElement("div");
        // Base class
        bedItem.className = `bed-item`;

        // Add status classes based on logic
        if (bed.occupied) {
            bedItem.classList.add('occupied');
        } else {
            bedItem.classList.add('available'); // It's available
            if (bed.isWindowSide) {
                bedItem.classList.add('window-side'); // Add window-side if also available
            }
        }

        // Set inner HTML content
        bedItem.innerHTML = `
            <p class="bed-number-label">${bed.bedNumber}</p>
            <p>${bed.isWindowSide ? '(Window Side)' : ''}</p>
            <p>${bed.occupied ? '(Occupied)' : '(Available)'}</p>
        `;

        // Add click listener and title
        if (!bed.occupied) {
            bedItem.onclick = () => confirmBooking(room._id, bed.bedNumber, false, originalBlock, originalFloor); // Pass block/floor
            bedItem.title = `Click to book Bed ${bed.bedNumber}`;
        } else {
            bedItem.title = `Bed ${bed.bedNumber} is Occupied`;
        }

        bedsLayoutContainer.appendChild(bedItem);
    });

    const backButton = document.getElementById("back-to-rooms-btn");
    if(backButton) {
        // Go back and re-fetch the list for the original selection
        backButton.onclick = () => {
             // Optionally re-select the original block/floor in the dropdowns
             const blockSelect = document.getElementById("block-select");
             const floorSelect = document.getElementById("floor-select");
             if(blockSelect) blockSelect.value = originalBlock;
             if(floorSelect) floorSelect.value = originalFloor;
             // Then fetch
             fetchAndShowRooms();
        }
    }
}


// --- Confirm and Book Bed --- (UPDATED - pass block/floor)
function confirmBooking(roomId, bedNumber, isOccupied, block, floor) {
    if (isOccupied) {
        showToast("This bed is already occupied!", 'error');
        return;
    }
    if (confirm(`Are you sure you want to book Bed ${bedNumber}?`)) {
        bookBed(roomId, bedNumber, block, floor); // Pass block/floor
    }
}

// --- Book Bed --- (UPDATED - use block/floor on success)
async function bookBed(roomId, bedNumber, block, floor) {
    if (!token) {
        showToast("Authentication error. Please log in again.", 'error');
        return;
    }
    try {
        const res = await fetch(`${baseUrl}/api/rooms/book/${roomId}/${bedNumber}`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
            showToast(data.message || `Bed ${bedNumber} booked successfully!`, 'success');
            // Re-fetch rooms for the original block/floor to show updated status
             const blockSelect = document.getElementById("block-select");
             const floorSelect = document.getElementById("floor-select");
             if(blockSelect) blockSelect.value = block; // Ensure correct selection
             if(floorSelect) floorSelect.value = floor; // Ensure correct selection
             fetchAndShowRooms(); // Fetch the list again
        } else {
            throw new Error(data.error || 'Booking failed');
        }
    } catch (error) {
        console.error("Booking Error:", error);
        showToast(`Booking Error: ${error.message}`, 'error');
    }
}