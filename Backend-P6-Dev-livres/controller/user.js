const bcrypt = require('bcrypt') 
const User = require('../model/user') 
const jwt = require('jsonwebtoken')

exports.signup= (req,res,next)=>{
    bcrypt.hash(req.body.password, 10)
    .then(hash=>{
        const user = new User({
            email:req.body.email,
            password:hash
        })
        user.save()
        .then(()=>res.status(201).json({message:'utilisateur cree'}))
        .catch(error=>res.status(400).json({error}))
    })
    .catch(error=>res.status(500).json({error}))
}

exports.login=(req,res,next)=>{
    User.findOne({email:req.body.email})
    .then(user=>{
        if(user === null){
            res.status(401).json({message:'email/password incorect'})
        }else{
            bcrypt.compare(req.body.password, user.password)
            .then(valide=>{
                if (!valide) {
                    res.status(401).json({message:'email/password incorect'})
                }else{
                    res.status(200).json({
                        userId: user._id,
                        token:jwt.sign(
                            {userId: user._id},
                            'RANDOM-TOKEN-SECRET' ,
                            {expiresIn:'24h'}
                        )
                    }) 
                }}
            )
            .catch()
        }
    })
    .catch(error=>{
        res.status(500).json({error}) 
    })

}

