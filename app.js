const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL pool setup
const pool = new Pool({
    user: 'postgres',
    host: '34.87.138.19',
    database: 'postgres',
    password: '#g%~@Hn)Pr9Sc@/]',
    port: 5432, // default PostgreSQL port
});

// Function to pad numbers
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

// Function to generate codes ensuring uniqueness
function generateCodes(number, startingNumber, team) {
    var codes = [];
    var currentNumber = startingNumber + 1;
    var date = new Date().toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'

    for (var i = 0; i < number; i++) {
        var code = 'EORE' + pad(currentNumber, 5);
        codes.push({ code: code, team: team, date: date });
        currentNumber++;
    }

    // Return the new current number and generated codes
    return { codes: codes, newStartingNumber: currentNumber - 1 };
}

// Route to generate codes
app.post('/generate-codes', async (req, res) => {
    const { numberOfCodes, team } = req.body;

    try {
        const client = await pool.connect();
        try {
            // Get the last generated code from the database
            const result = await client.query('SELECT code FROM codes ORDER BY id DESC LIMIT 1');
            const lastCode = result.rows.length > 0 ? result.rows[0].code : null;
            let currentNumber = lastCode ? parseInt(lastCode.replace('EORE', '')) : 0;

            // Generate new codes
            const { codes, newStartingNumber } = generateCodes(parseInt(numberOfCodes), currentNumber, team);

            // Log the generated codes
            console.log('Generated codes:', codes);

            // Send the generated codes as response
            res.json({ codes: codes, newStartingNumber: newStartingNumber });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error generating codes:', error);
        res.status(500).send('Error generating codes');
    }
});

// Route to save codes to the database
app.post('/save-codes', async (req, res) => {
    const { codes } = req.body;

    try {
        const client = await pool.connect();
        try {
            const insertQuery = 'INSERT INTO codes (code, team, date_generated) VALUES ($1, $2, $3)';
            const insertValues = codes.map(code => [code.code, code.team, code.date]);

            for (const value of insertValues) {
                // Log each value being inserted
                console.log('Inserting value:', value);
                await client.query(insertQuery, value);
            }

            res.send('Codes saved successfully');
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error saving codes:', error);
        res.status(500).send('Error saving codes');
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
