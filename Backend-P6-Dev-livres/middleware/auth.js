const jwt = require('jsonwebtoken');
require('dotenv').config();  

module.exports = (req,res,next)=>{
    try{const authHeader = req.headers.authorization; // Vérifie si l'en-tête est présent
        if (!authHeader) {
          throw new Error('Token manquant');
        }else{
            console.log('Authorization Header:', req.headers.authorization);
        }  
        const token = req.headers.authorization.split(' ')[1] 
        const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET) 
        console.log('Decoded Token:', decodedToken);  
        const userId = decodedToken.userId
        req.auth = {
            userId : userId 
        }
        next(); 
    }catch(error){res.status(401).json({error})}
    
}

