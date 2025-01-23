document.addEventListener('DOMContentLoaded', () => {
    const url = 'http://localhost:4001/fetch-tv-listings';
    const searchInput = document.getElementById('searchInput');
    const dateSelector = document.getElementById('dateSelector');
    const spinner = document.getElementById('spinner');
    let tvListings = [];

    populateDateDropdown();
    fetchListingsForSelectedDate();

    dateSelector.addEventListener('change', () => {
        fetchListingsForSelectedDate();
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        renderGuide(tvListings, searchTerm);
    });

    function fetchListingsForSelectedDate() {
        const selectedDateOption = dateSelector.value;
        if (selectedDateOption) {
            const fetchUrl = `${url}?date=${formatDateForParam(selectedDateOption)}`;
            showSpinner(); // Show spinner before fetching
            fetch(fetchUrl)
                .then(response => response.json())
                .then(data => {
                    hideSpinner(); // Hide spinner once data is ready
                    tvListings = data;
                    const currentSearchTerm = searchInput.value.toLowerCase();
                    renderGuide(tvListings, currentSearchTerm);
                })
                .catch(error => {
                    hideSpinner(); // Hide spinner if there's an error
                    console.error('Error fetching data:', error);
                });
        }
    }

    function populateDateDropdown() {
        const today = new Date();
        for (let i = 0; i <= 6; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const option = document.createElement("option");
            option.value = date.toISOString().slice(0, 10); // Format as YYYY-MM-DD
            option.textContent = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString();
            dateSelector.appendChild(option);
        }

        // Set the default selected value to today
        dateSelector.value = today.toISOString().slice(0, 10);
    }

    function formatDateForParam(date) {
        const [year, month, day] = date.split("-");
        return `${day}-${month}-${year}`;
    }

    function renderGuide(jsonData, filter = '') {
        const contentDiv = document.getElementById('channels');
        contentDiv.innerHTML = '';

        jsonData.data.forEach(channel => {
            const filteredAirings = channel.airings.filter(airing =>
                airing.title.toLowerCase().includes(filter) ||
                airing.description.toLowerCase().includes(filter)
            );

            if (filteredAirings.length > 0) {
                const channelDiv = document.createElement('div');
                channelDiv.classList.add('channel');

                const logo = `<img src="${channel.logo}" alt="${channel.name} logo">`;
                const channelInfo = `<h2>${logo} ${channel.name}</h2>`;

                channelDiv.innerHTML = channelInfo;

                const now = Date.now() / 1000; // Current time in seconds

                filteredAirings.forEach(airing => {
                    const airingDiv = document.createElement('div');

                    // Apply the 'currently-airing' class if the program is currently airing
                    if (airing.airing_start <= now && airing.airing_end >= now) {
                        airingDiv.classList.add('program', 'currently-airing');
                    } else {
                        airingDiv.classList.add('program');
                    }

                    const showImage = airing.image && airing.image.modal ?
                        `<img src="${airing.image.modal}" alt="${airing.title} image" style="height: 50px;">` : '';

                    const programDetails = `
                <div class="program-details">
                  <h3>${airing.show.title}</h3>
                  <h4>${airing.title}</h4>
                  <p>${airing.description}</p>
                  <span>${new Date(airing.airing_start * 1000).toLocaleString()}</span>
                </div>
                `;

                    const addToCalendarButton = `<button class="add-to-calendar">Add to Calendar</button>`;

                    airingDiv.innerHTML = `${showImage}${programDetails}${addToCalendarButton}`;
                    channelDiv.appendChild(airingDiv);

                    // Add calendar button event listener
                    const button = airingDiv.querySelector('.add-to-calendar');
                    button.addEventListener('click', () => {
                        addToCalendar(channel.name, airing);
                    });
                });

                contentDiv.appendChild(channelDiv);
            }
        });
    }

    function showSpinner() {
        spinner.style.display = 'block';
    }

    function hideSpinner() {
        spinner.style.display = 'none';
    }

    function addToCalendar(channelName, airing) {
        const titleText = airing.show.title !== airing.title ? `${airing.show.title} - ${airing.title}` : airing.title;
        const title = encodeURIComponent(titleText);
        const description = encodeURIComponent(`${channelName} - ${airing.description}`);
        const startDate = new Date(airing.airing_start * 1000).toISOString().replace(/-|:|\.\d+/g, '');
        const endDate = new Date(airing.airing_end * 1000).toISOString().replace(/-|:|\.\d+/g, '');

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}`;

        window.open(googleCalendarUrl, '_blank');
    }
});