const express = require('express');

const userStudyRouter = require('./routes/userstudy');
const app = express();

app.get('/', (req, res) => res.send('Home Page Route'));

app.get('/about', (req, res) => res.send('About Page Route'));

app.get('/portfolio', (req, res) => res.send('Portfolio Page Route'));

app.get('/contact', (req, res) => res.send('Contact Page Route'));
app.use('/userstudy', userStudyRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`))