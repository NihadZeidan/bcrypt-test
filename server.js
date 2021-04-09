'use strict';
require('dotenv').config();

const express = require('express');
const app = express();
const pg = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client({
    connectionString: DATABASE_URL,
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('pages/index');
});


app.post('/register', handelRegister);


async function handelRegister(request, res) {

    try {
        const email = request.body.email;
        const password = request.body.password;

        const hash = await bcrypt.hash(password, 10);

        const safeValues = [email, hash];
        const InsetIntoDataBaseQuery = 'INSERT INTO users (email, pass) VALUES ($1, $2);';
        await client.query(InsetIntoDataBaseQuery, safeValues).then((results) => {

            res.render('pages/login');
        })

    } catch (error) {
        console.log(error);
        res.send("CHECK YOU TERMINAL SOMETHING WENT WRONG");
    }

}


app.post('/login', handleLogin);

async function handleLogin(req, res) {


    try {
        const email = req.body.email;
        const password = req.body.password;
        const safe = [email]
        const getDataBaseQuery = 'SELECT * FROM users WHERE email=$1;';
        await client.query(getDataBaseQuery, safe).then(async(results) => {

            if (results) {
                const validation = await bcrypt.compare(password, results.rows[0].pass)

                if (validation) {
                    res.send("Welcome");
                } else {
                    res.send("Wrong PASS");
                };

            } else {
                res.send("No such data in theD DB");
            };
        });

    } catch (error) {
        console.log(error);
    };

};

client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);