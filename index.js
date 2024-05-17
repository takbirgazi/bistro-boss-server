const express =  require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send('Bistro Boss Is Running');
})
app.listen(port, ()=>{
    console.log(`Server Is Running at port ${port}`);
})