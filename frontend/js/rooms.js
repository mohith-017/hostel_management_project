const baseUrl = "http://localhost:5000";
const findRoomsBtn = document.getElementById("find-rooms-btn");
const logoutBtn = document.getElementById("logout-btn");
const viewContainer = document.getElementById("view-container");

// Initial check for token
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

findRoomsBtn.addEventListener("click", fetchAndShowRooms);
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

async function fetchAndShowRooms() {
    const block = document.getElementById("block-select").value;
    const floor = document.getElementById("floor-select").value;

    if (!block || !floor) {
        viewContainer.innerHTML = `<p>Please select a block and a floor to begin.</p>`;
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/api/rooms/query?block=${block}&floor=${floor}`);
        if (!res.ok) throw new Error('Could not fetch rooms.');
        
        const rooms = await res.json();
        viewContainer.innerHTML = ""; // Clear previous results

        if (rooms.length === 0) {
            viewContainer.innerHTML = `<p>No rooms found for this selection.</p>`;
            return;
        }

        rooms.forEach(room => {
            const roomBox = document.createElement("div");
            roomBox.className = "room-box";
            roomBox.innerHTML = `<h3>${room.roomNumber}</h3>`;
            roomBox.addEventListener("click", () => showBedLayout(room));
            viewContainer.appendChild(roomBox);
        });
    } catch (error) {
        viewContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function showBedLayout(room) {
    viewContainer.innerHTML = `<h2>Room: ${room.roomNumber}</h2>`;
    const bedsContainer = document.createElement("div");
    bedsContainer.className = "beds-layout";

    room.beds.forEach(bed => {
        let bedClasses = "bed-svg";
        if (bed.occupied) bedClasses += " occupied";
        else if (bed.isWindowSide) bedClasses += " window-side";
        else bedClasses += " available";

        const bedSVG = `
            <svg class="${bedClasses}" viewBox="0 0 24 24" onclick="confirmBooking('${room._id}', '${bed.bedNumber}', ${bed.occupied})">
              <title>Bed ${bed.bedNumber}${bed.occupied ? ` (Occupied by ${bed.occupant?.admissionNo || 'N/A'})` : ''}</title>
              <path class="bed-fill" d="M19,7H5C3.9,7,3,7.9,3,9v6c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V9C21,7.9,20.1,7,19,7z M7,13.5 c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5S8.5,11.17,8.5,12S7.83,13.5,7,13.5z"/>
            </svg>
        `;
        bedsContainer.innerHTML += bedSVG;
    });

    viewContainer.appendChild(bedsContainer);

    const backButton = document.createElement("button");
    backButton.innerText = "← Back to Room List";
    backButton.onclick = fetchAndShowRooms;
    viewContainer.appendChild(backButton);
}

function confirmBooking(roomId, bedNumber, isOccupied) {
    if (isOccupied) {
        alert("This bed is already occupied!");
        return;
    }
    if (confirm(`Are you sure you want to book Bed ${bedNumber}?`)) {
        bookBed(roomId, bedNumber);
    }
}

async function bookBed(roomId, bedNumber) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${baseUrl}/api/rooms/book/${roomId}/${bedNumber}`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();
        alert(data.message || data.error);

        if (res.ok) {
            fetchAndShowRooms(); // Refresh the view to show the newly booked bed
        }
    } catch (error) {
        alert("An error occurred during booking.");
    }
}

// Change this function in your rooms.js
// Function to display the bed layout for a selected room
function showBedLayout(room) {
    viewContainer.innerHTML = `<h2>Room: ${room.roomNumber}</h2>`;
    const bedsContainer = document.createElement("div");
    bedsContainer.className = "beds-layout";

    room.beds.forEach(bed => {
        let bedClass;
        if (bed.occupied) {
            bedClass = 'occupied'; // Grey
        } else if (bed.isWindowSide) {
            bedClass = 'window-side'; // Orange
        } else {
            bedClass = 'available'; // Green
        }
        
        // ⭐ UPDATED: Added a wrapper div and bed number text
        const bedItem = document.createElement("div");
        bedItem.className = "bed-item"; // New class for individual bed container

        // ⭐ UPDATED: New, more detailed SVG for a bed
        const bedSVG = `
            <svg class="bed-svg ${bedClass}" viewBox="0 0 200 100" 
                 onclick="confirmBooking('${room._id}', '${bed.bedNumber}', ${bed.occupied})">
                <title>${bed.bedNumber}${bed.isWindowSide ? ' (Window Side)' : ''}${bed.occupied ? ` (Occupied by ${bed.occupant?.name || bed.occupant?.admissionNo || 'N/A'})` : ''}</title>
                
                <rect x="10" y="10" width="180" height="80" rx="10" ry="10" class="bed-base"/>
                
                <rect x="20" y="15" width="40" height="20" rx="5" ry="5" class="bed-pillow"/>
                <rect x="140" y="15" width="40" height="20" rx="5" ry="5" class="bed-pillow"/>
                
                <rect x="15" y="38" width="170" height="47" rx="5" ry="5" class="bed-mattress"/>
                
                </svg>
        `;
        
        bedItem.innerHTML = bedSVG + `<p class="bed-number-label">${bed.bedNumber}</p>`;
        bedsContainer.appendChild(bedItem);
    });

    viewContainer.appendChild(bedsContainer);

    const backButton = document.createElement("button");
    backButton.innerText = "← Back to Room List";
    backButton.onclick = fetchAndShowRooms;
    viewContainer.appendChild(backButton);
}