const express = require('express'); 
const mongoose = require('mongoose')
require('dotenv').config();  
const bodyParser = require('body-parser') 
const path = require('path');

mongoose.connect(process.env.MONGODB_URI,  
    { useNewUrlParser: true, 
        useUnifiedTopology: true }
)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express(); 

const userRoutes = require('./routes/routes-user')
const stuffRoutes = require('./routes/routes-book')  
   
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  })  

app.use(bodyParser.json())  
 
app.use('/api/auth', userRoutes) // userRoutes = adress de api + function dans controller
app.use('/api/books', stuffRoutes) 
app.use('/images', express.static(path.join(__dirname, 'images'))); 

module.exports = app;  