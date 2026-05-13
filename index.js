require('dotenv').config()
const express = require('express');
const { Client } = require('pg');

const SERVER_PORT = process.env.SERVER_PORT;
const app = express()
app.use(express.json())

const pgc = new Client(process.env.DATABASE_URL)
pgc.connect();

async function init_db() {
    try {
        await pgc.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                name TEXT,
                dob TEXT,
                condition TEXT,
                credit_card TEXT,
                address TEXT
            )
        `);
        
        await pgc.query(`DELETE FROM patients`); // cleaning, fresh start
        await pgc.query(`
            INSERT INTO patients (name, dob, condition, credit_card, address)
            VALUES
                ('John Doe', '1985-03-15', 'Diabetes', '4111-1111-1111-1111', '123 Main St, NY'),
                ('Jane Smith', '1992-07-22', 'Hypertension', '4222-2222-2222-2222', '456 Oak Ave, CA'),
                ('Bob Johnson', '1978-11-05', 'Asthma', '4333-3333-3333-3333', '789 Pine Rd, TX'),
                ('Alice Williams', '1990-05-12', 'Allergy', '4444-4444-4444-4444', '101 Maple St, WA'),
                ('Charlie Brown', '1982-01-30', 'Flu', '4555-5555-5555-5555', '202 Elm St, OR'),
                ('David Miller', '1975-09-18', 'Back Pain', '4666-6666-6666-6666', '303 Birch Ln, NV'),
                ('Eve Davis', '1995-12-03', 'Migraine', '4777-7777-7777-7777', '404 Cedar Dr, CO'),
                ('Frank Wilson', '1968-06-25', 'Heart Disease', '4888-8888-8888-8888', '505 Spruce Ct, AZ'),
                ('Grace Lee', '1988-08-14', 'Insomnia', '4999-9999-9999-9999', '606 Walnut Way, UT'),
                ('Henry Moore', '1993-02-28', 'Obesity', '5111-1111-1111-1111', '707 Poplar Pl, ID'),
                ('Ivy Taylor', '1980-10-10', 'Anxiety', '5222-2222-2222-2222', '808 Ash Blvd, MT'),
                ('Jack White', '1972-04-05', 'Arthritis', '5333-3333-3333-3333', '909 Cherry Sq, WY'),
                ('Karen Black', '1984-11-20', 'Depression', '5444-4444-4444-4444', '111 Fir Ter, NM');
        `);
    } catch (e) {
        console.log(e);
    } finally {
        console.clear();
        console.log("Database is ready with patient data!");
        app.listen(SERVER_PORT, () => {
            console.log(`Hospital server running at http://localhost:${SERVER_PORT}`);
        })
    }   
}
init_db();

app.get('/', async (req, res) => {
    try {
        const result = await pgc.query(`SELECT * FROM patients;`);
        const rows = result.rows;

        let tableHtml = `
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; }
                    table { width: 100%; border-collapse: collapse; background-color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                    th, td { border: 1px solid #e0e0e0; padding: 15px; text-align: left; }
                    th { background-color: #2c3e50; color: white; text-transform: uppercase; font-size: 14px; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    tr:hover { background-color: #f1f1f1; }
                    h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
                    .container { max-width: 1200px; margin: auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div style="display: flex; justify-content: center; justify-items: center;">
                        <h1>Patients Data (Authorized Access only!)</h1>
                        <div>
                            <button style="background-color: black; color:white; padding: 8px;" onclick="window.location.href = '/search';">Go to Search</button>
                            <button style="background-color: black; color:white; padding: 8px;" onclick="window.location.href = '/';">Refresh</button>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>DOB</th>
                                <th>Condition</th>
                                <th>Credit Card</th>
                                <th>Address</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        rows.forEach(row => {
            tableHtml += `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.name}</td>
                    <td>${row.dob}</td>
                    <td>${row.condition}</td>
                    <td>${row.credit_card}</td>
                    <td>${row.address}</td>
                </tr>
            `;
        });

        tableHtml += `
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        res.send(tableHtml);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching patient data");
    }
})

app.get('/search', async (req, res) => {
    const query = req.query.q || '';
    
    const htmlStart = `
    <button style="background-color: black; color:white; padding: 8px;" onclick="window.location.href='/'">Go Back</button>
    <h1>Search Hospital Database</h1>
    <form method="GET" action="/search">
        <input type="text" name="q" placeholder="Search by name or condition" value="${query}" style="width:300px;padding:10px;">
        <button style="background-color: black; color:white; padding: 8px;" type="submit">Search</button>
    </form>`;

    if (!query) return res.send(htmlStart);

    try {
        // ❌ VULNERABLE: Direct concatenation
        const sql = `SELECT * FROM patients WHERE name ILIKE '%${query}%' OR condition ILIKE '%${query}%'`;
        
        console.log("Executing:", sql); // Visible in terminal for video
        
        const result = await pgc.query(sql);

        let html = htmlStart + `<h2>Results (${result.rows.length} found)</h2><table border="1" cellpadding="8">`;
        html += `<tr><th>ID</th><th>Name</th><th>DOB</th><th>Condition</th><th>Credit Card</th><th>Address</th></tr>`;

        result.rows.forEach(row => {
            html += `<tr>
                <td>${row.id}</td>
                <td>${row.name}</td>
                <td>${row.dob}</td>
                <td>${row.condition}</td>
                <td>${row.credit_card}</td>
                <td>${row.address}</td>
            </tr>`;
        });

        html += `</table>`;
        res.send(html);

    } catch (err) {
        console.error(err);
        res.send(htmlStart + `<p style="color:red;">Error: ${err.message}</p>`);
    }
});

app.get('/data' , async (req, res) => {
    const data = await pgc.query("SELECT * FROM patients;");
    res.json(data.rows);
})

// app.listen(SERVER_PORT, () => {
//     console.log(`Hospital server running at http://localhost:${SERVER_PORT}`);
// })