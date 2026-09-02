const express = require('express');
let app = express();
app.use(express.static(process.cwd()));
app.listen(8080);
console.log("http://localhost:8080/PSP/");