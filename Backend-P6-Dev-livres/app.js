const express = require('express'); 
const mongoose = require('mongoose')
const bodyParser = require('body-parser') 
const path = require('path');

mongoose.connect('mongodb+srv://changxuhuang:hcx19950511@web-livres.rbz3j.mongodb.net/?retryWrites=true&w=majority&appName=Web-Livres',
    { useNewUrlParser: true, 
        useUnifiedTopology: true }
)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express(); 

const userRoutes = require('./routes/user')
const stuffRoutes = require('./routes/stuff') 
   
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