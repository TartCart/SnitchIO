// Request log data from the main process
window.electronAPI.requestLogData();

// receive log data from the main process and process it
window.electronAPI.receiveLogData((data) => {
    if (data.error) {
        console.error('Error receiving log data:', data.error);
        return;
    }



    // Process the log data to count alerts
    const logData = data.data;
    const powershellAlertsCount = (logData.match(/PowerShell Command Detected/gi) || []).length;
    const installedAppsAlertsCount = (logData.match(/New Software Detected/gi) || []).length;
    const cmdsAlertsCount = (logData.match(/CMD.EXE Command Detected/gi) || []).length;
    const rdpsAlertsCount = (logData.match(/RDP Connection Detected/gi) || []).length;
    const totalAlertsCount = powershellAlertsCount + installedAppsAlertsCount + cmdsAlertsCount + rdpsAlertsCount;

    // Update the HTML with the counts
    document.getElementById('powershell-alerts-count').textContent = powershellAlertsCount;
    document.getElementById('installed-apps-alerts-count').textContent = installedAppsAlertsCount;
    document.getElementById('cmds-alerts-count').textContent = cmdsAlertsCount;
    document.getElementById('rdps-alerts-count').textContent = rdpsAlertsCount;
    document.getElementById('total-alerts-count').textContent = totalAlertsCount;

    const alertsByDay = {};

    // Regular expression to match log entries and extract dates and types
    const logEntryRegex = /(\d+\/\d+\/\d+)\s\d+:\d+:\d+\s[AP]M\s-\s(.+):/g;
    let match;

    while ((match = logEntryRegex.exec(logData)) !== null) {
        const [_, date, alertType] = match;
        if (!alertsByDay[date]) {
            alertsByDay[date] = { PowerShell: 0, CMD: 0, InstalledApps: 0, RDP: 0, Total: 0 };
        }
        if (alertType.includes("PowerShell Command Detected")) {
            alertsByDay[date].PowerShell++;
        } else if (alertType.includes("CMD.EXE Command Detected")) {
            alertsByDay[date].CMD++;
        } else if (alertType.includes("New Software Detected")) {
            alertsByDay[date].InstalledApps++;
        } else if (alertType.includes("RDP Connection Detected")) {
            alertsByDay[date].RDP++;
        }
        alertsByDay[date].Total++;
    }

    // Proceed to generate the chart
    generateChart(alertsByDay);
});

function generateChart(alertsByDay) {
    const ctx = document.getElementById('alertsChart').getContext('2d');
    const dates = Object.keys(alertsByDay);
    const powerShellData = dates.map(date => alertsByDay[date].PowerShell);
    const cmdData = dates.map(date => alertsByDay[date].CMD);
    const installedAppsData = dates.map(date => alertsByDay[date].InstalledApps);
    const rdpData = dates.map(date => alertsByDay[date].RDP);

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'PowerShell Alerts',
                data: powerShellData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'CMD Alerts',
                data: cmdData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                label: 'Installed Apps Alerts',
                data: installedAppsData,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }, {
                label: 'RDP Alerts',
                data: rdpData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                }
            }
        }
    });
}