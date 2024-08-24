const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Mengimpor file routes/index.js

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use('/', routes); // Menggunakan routes dari routes/index.js

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Haiiii Server running on port ${PORT}`);
});