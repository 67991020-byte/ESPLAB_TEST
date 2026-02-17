// DOM Elements
const tempVal = document.getElementById('temp-value');
const tempProg = document.getElementById('temp-progress');
const humidVal = document.getElementById('humidity-value');
const humidProg = document.getElementById('humidity-progress');
const touchIndicator = document.getElementById('touch-indicator');
const touchStatus = document.getElementById('touch-status');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');

// Chart Configuration
const ctx = document.getElementById('sensorChart').getContext('2d');
const sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperature (°C)',
            data: [],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
        }, {
            label: 'Humidity (%)',
            data: [],
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: '#94a3b8', font: { family: 'Outfit' } }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        },
        animation: { duration: 0 }
    }
});

// Update UI Function
function updateUI(temp, humidity, touch, timestamp = null) {
    // Update Text and Bars
    tempVal.innerText = temp.toFixed(1);
    tempProg.style.width = `${(temp / 50) * 100}%`;

    humidVal.innerText = humidity.toFixed(0);
    humidProg.style.width = `${humidity}%`;

    // Update Touch Sensor (handle 0/1 or true/false)
    const isTouched = touch == 1 || touch === true || touch === "1";
    if (isTouched) {
        touchIndicator.classList.add('active');
        touchStatus.innerText = "Touched!";
        touchStatus.style.color = "#f43f5e";
    } else {
        touchIndicator.classList.remove('active');
        touchStatus.innerText = "Not Touched";
        touchStatus.style.color = "#94a3b8";
    }

    // Update Chart
    const timeLabel = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Prevent duplicate entries if polling same CSV
    if (sensorChart.data.labels[sensorChart.data.labels.length - 1] === timeLabel) return;

    if (sensorChart.data.labels.length > 20) {
        sensorChart.data.labels.shift();
        sensorChart.data.datasets[0].data.shift();
        sensorChart.data.datasets[1].data.shift();
    }

    sensorChart.data.labels.push(timeLabel);
    sensorChart.data.datasets[0].data.push(temp);
    sensorChart.data.datasets[1].data.push(humidity);
    sensorChart.update();
}

// CSV Fetching Logic
async function fetchCSVData() {
    try {
        const response = await fetch('sensor_data.csv');
        const csvText = await response.text();

        // Split by lines and filter out empty ones
        const lines = csvText.trim().split('\n').filter(line => line.length > 0);

        // Skip header (lines[0]) and get the last data row
        if (lines.length > 1) {
            const lastRow = lines[lines.length - 1].split(',');

            // Expected format: timestamp, temperature, humidity, touch
            const timestamp = lastRow[0];
            const temp = parseFloat(lastRow[1]);
            const humidity = parseFloat(lastRow[2]);
            const touch = lastRow[3].trim();

            updateUI(temp, humidity, touch, timestamp);

            statusText.innerText = "Syncing CSV";
            statusDot.style.backgroundColor = "#22c55e";
        }
    } catch (error) {
        console.error('Error fetching CSV:', error);
        statusText.innerText = "CSV Fetch Error";
        statusDot.style.backgroundColor = "#ef4444";
    }
}

// Initial fetch and set interval
fetchCSVData();
setInterval(fetchCSVData, 3000); // Check for CSV updates every 3 seconds
