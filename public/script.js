// Function to pad numbers
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

// Function to display codes
function displayCodes(codes) {
    var codesContainer = document.getElementById('codes');
    codesContainer.innerHTML = '';

    var table = document.createElement('table');
    table.classList.add('codes-table');

    // Create table header
    var headerRow = document.createElement('tr');
    var headers = ['Code', 'Team', 'Date Generated'];
    headers.forEach(function(headerText) {
        var header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    // Create table rows
    codes.forEach(function(item) {
        var row = document.createElement('tr');
        var codeColumn = document.createElement('td');
        var teamColumn = document.createElement('td');
        var dateColumn = document.createElement('td');

        codeColumn.textContent = item.code;
        teamColumn.textContent = item.team;
        dateColumn.textContent = item.date;

        row.appendChild(codeColumn);
        row.appendChild(teamColumn);
        row.appendChild(dateColumn);

        table.appendChild(row);
    });

    codesContainer.appendChild(table);
}

// Function to copy codes
async function copyCodes() {
    var codesTable = document.querySelector('.codes-table');
    var rows = codesTable.querySelectorAll('tr');
    var textToCopy = '';

    // Start from the second row to skip the header
    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].querySelectorAll('td');
        var codeText = cells[0].textContent;
        var teamText = cells[1].textContent;
        var dateText = cells[2].textContent;

        // Format the text as "Codes | Team code | date"
        textToCopy += codeText + ' | ' + teamText + ' | ' + dateText;

        // Add a line break after each code, except the last one
        if (i < rows.length - 1) {
            textToCopy += '\n';
        }
    }

    try {
        // Use the Clipboard API to write text
        await navigator.clipboard.writeText(textToCopy);
        alert('Codes copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy codes: ', err);
    }
}

// Function to save codes
async function saveCodes() {
    var codesTable = document.querySelector('.codes-table');
    var rows = codesTable.querySelectorAll('tr');
    var codesToSave = [];

    // Start from the second row to skip the header
    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].querySelectorAll('td');
        var code = cells[0].textContent;
        var team = cells[1].textContent;
        var date = cells[2].textContent;

        codesToSave.push({ code: code, team: team, date: date });
    }

    try {
        const response = await fetch('/save-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codes: codesToSave })
        });

        if (response.ok) {
            alert('Codes saved successfully!');
        } else {
            alert('Failed to save codes.');
        }
    } catch (err) {
        console.error('Failed to save codes: ', err);
    }
}

// Event listener for form submission
document.getElementById('codeForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    var numberOfCodes = parseInt(document.getElementById('numberOfCodes').value);
    var team = document.getElementById('team').value;

    try {
        const response = await fetch('/generate-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numberOfCodes: numberOfCodes, team: team })
        });

        if (response.ok) {
            const data = await response.json();
            displayCodes(data.codes);

            // Show the save and export buttons
            document.getElementById('saveButton').style.display = 'inline-block';
            document.getElementById('exportButton').style.display = 'inline-block';
        } else {
            alert('Failed to generate codes.');
        }
    } catch (err) {
        console.error('Error generating codes:', err);
    }
});

// Event listener for saving codes
document.getElementById('saveButton').addEventListener('click', saveCodes);

// Event listener for exporting the table as an image
document.getElementById('exportButton').addEventListener('click', function() {
    var codesContainer = document.getElementById('codes');
    html2canvas(codesContainer, {
        backgroundColor: '#fff' // Ensure background color is set correctly
    }).then(function(canvas) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 1.0); // Convert to JPG with highest quality
        link.download = 'codes.jpg';
        link.click();
    });
});
