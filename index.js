const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



app.get('/',(req, res)=>{
    res.send('Toy MarketPlace Is Running');
})

app.listen(port, ()=>{
    console.log(`Toy MarketPlace Server is listening on Port: ${port}`);
})