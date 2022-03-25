const express = require('express');
const cors = require('cors')

const userStudyRouter = require('./routes/userstudy');
const userDataRouter = require('./routes/userdata')
const app = express();
app.use(cors({origin:"*"}))
app.use(express.json())

app.get('/', (req, res) => res.send('Home Page Route 5'));

app.get('/about', (req, res) => res.send('About Page Route'));

app.use('/userstudy', userStudyRouter);
app.use('/userdata', userDataRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`))