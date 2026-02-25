// --- MQTT & UI Dashboard Logic ---

let tempChart, humChart;
let historyData = [];
const MAX_HISTORY = 10;
let client;

// --- 1. MQTT LOGIC ---
function initMQTT() {
    // MQTT_CONFIG is expected to be loaded from config.js
    if (typeof MQTT_CONFIG === 'undefined') {
        console.error("MQTT_CONFIG is not defined. Make sure config.js is loaded.");
        return;
    }

    client = new Paho.MQTT.Client(MQTT_CONFIG.hostname, MQTT_CONFIG.port, MQTT_CONFIG.path, MQTT_CONFIG.clientId);

    client.onConnectionLost = (resp) => {
        console.log("Connection Lost:", resp.errorMessage);
        document.getElementById('connection-status').textContent = "Disconnected";
        document.getElementById('connection-dot').style.backgroundColor = "#f43f5e";
        document.getElementById('connection-dot').style.boxShadow = "none";
        setTimeout(initMQTT, 5000);
    };

    client.onMessageArrived = (message) => {
        console.log("Data Arrived:", message.payloadString);
        try {
            const data = JSON.parse(message.payloadString);
            data.time = new Date().toLocaleTimeString();

            historyData.push(data);
            if (historyData.length > MAX_HISTORY) historyData.shift();

            updateUI(data);
        } catch (e) {
            console.error("JSON Parse Error:", e);
        }
    };

    const options = {
        useSSL: MQTT_CONFIG.useTLS,
        userName: MQTT_CONFIG.username,
        password: MQTT_CONFIG.password,
        onSuccess: () => {
            console.log("Connected to MQTT Broker");
            document.getElementById('connection-status').textContent = "Connected (MQTT)";
            document.getElementById('connection-dot').style.backgroundColor = "#22c55e";
            document.getElementById('connection-dot').style.boxShadow = "0 0 10px #22c55e";
            client.subscribe(MQTT_CONFIG.topic);
        },
        onFailure: (err) => {
            console.error("MQTT Connection Failed:", err.errorMessage);
            document.getElementById('connection-status').textContent = "Fail: " + err.errorMessage;
            document.getElementById('connection-dot').style.backgroundColor = "#f43f5e";
        }
    };
    client.connect(options);
}

// --- 2. UI & CHART LOGIC ---
function updateUI(data) {
    // Update Temperature
    if (data.temp !== undefined) {
        document.getElementById('current-temp').textContent = data.temp;
        document.getElementById('temp-progress').style.width = Math.min(data.temp * 2, 100) + "%";
    }

    // Update Humidity
    if (data.hum !== undefined) {
        document.getElementById('current-hum').textContent = data.hum;
        document.getElementById('hum-progress').style.width = Math.min(data.hum, 100) + "%";
    }

    // Update LED
    const ledStatus = data.led || data.status || "OFF";
    const ledText = document.getElementById('led-text');
    const ledBar = document.getElementById('led-indicator');

    if (ledStatus.toUpperCase() === "ON") {
        ledText.textContent = "ON";
        ledText.style.color = "#22c55e";
        ledBar.style.background = "#22c55e";
        ledBar.style.boxShadow = "0 0 10px rgba(34, 197, 94, 0.5)";
    } else {
        ledText.textContent = "OFF";
        ledText.style.color = "#ffffff";
        ledBar.style.background = "#475569";
        ledBar.style.boxShadow = "none";
    }

    // Update Table
    const tbody = document.getElementById('data-table-body');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${data.time}</td>
        <td>${data.temp}°C</td>
        <td>${data.hum}%</td>
        <td><span class="status-badge ${ledStatus.toUpperCase() === 'ON' ? 'status-on' : 'status-off'}">${ledStatus}</span></td>
    `;
    tbody.prepend(tr);
    if (tbody.rows.length > MAX_HISTORY) tbody.deleteRow(MAX_HISTORY);

    // Update Charts
    updateCharts();
}

function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                display: false
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    const tempCtx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temp',
                data: [],
                borderColor: '#6366f1',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }]
        },
        options: commonOptions
    });

    const humCtx = document.getElementById('humChart').getContext('2d');
    humChart = new Chart(humCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Hum',
                data: [],
                borderColor: '#a855f7',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(168, 85, 247, 0.1)'
            }]
        },
        options: commonOptions
    });
}

function updateCharts() {
    const labels = historyData.map(d => d.time);
    const tempData = historyData.map(d => d.temp);
    const humData = historyData.map(d => d.hum);

    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = tempData;
    tempChart.update('none'); // Update without animation for performance

    humChart.data.labels = labels;
    humChart.data.datasets[0].data = humData;
    humChart.update('none');
}

// Initialized when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initMQTT();
});
