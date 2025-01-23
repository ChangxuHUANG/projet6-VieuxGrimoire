const { json } = require('express')
const Book = require('../model/book')
const sharp = require('sharp') 
const fs = require('fs')
const { title } = require('process')

exports.getAllBooks = (req,res,next)=>{
    Book.find()
    .then(books=>{
        console.log('Livres trouvés :', books);
        res.status(200).json(books);
      })
    .catch(error=>{
        console.error('Erreur lors de la récupération des livres :', error);
        res.status(404).json({ error });
      })   
} 

exports.getOneBook = (req,res,next)=>{
    Book.findOne({_id:req.params.id}) 
    .then(book=>res.status(200).json(book))
    .catch(error=>res.status(400).json({error}))  
}  

exports.getBestRating = (req, res, next) => {
    
        Book.find()
            .sort({ averageRating: -1 }) // Tri décroissant selon la moyenne des notes
            .limit(3) 
            .then(books => res.status(200).json(books)) 
            .catch(error => res.status(500).json({ error })); 
    };

exports.modifyBook = (req,res,next)=>{
    const bookObject = req.file 
        ? {
            
            ...JSON.parse(req.body.book),
            
            imageUrl: `${req.protocol}://${req.get('host')}/images/optimized_${req.file.filename}`, 
            //imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, 
        }
        : { title:req.body.title,
            author:req.body.author,
            year:req.body.year, 
            genre:req.body.genre 
            
        };

    delete bookObject._userId;
    console.log('Objet à mettre à jour :', bookObject);

    Book.findOne({ _id: req.params.id })
        .then((book) => {

            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            } 

            
            if (req.file) {

                // Optimisation de l'image téléchargée avec Sharp
                const optimizedImagePath = `images/optimized_${req.file.filename}`;
                sharp(req.file.path)
                    .resize(800)
                    .toFormat('jpeg') 
                    .jpeg({ quality: 80 })
                    .toFile(optimizedImagePath) 
                    .then(() => {
                                console.log("optimisation reussie");
                               
                                // Mise à jour du livre dans la base de données en cas de fiche
                                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                                .then(() => {   
                                res.status(200).json({ message: 'Livre modifié avec succès !' })
                                console.log('Image mise à jour avec succès !');  
                                 } )
                                .catch((error) => res.status(400).json({ message: 'Erreur lors de la modification du livre' }));
                        }) 
                    .catch((err) => {
                        return res.status(500).json({ error: 'Erreur lors de l\'optimisation de l\'image' });
                    });
                    /*fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error("Erreur lors de la suppression de la photo temporaire :", err);
                        } else {
                            console.log("Photo temporaire supprimée avec succès");
                        }
                    });*/ 

            }else{ // Mise à jour du livre dans la base de données en cas de non-fiche
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                                .then(() => {   
                                res.status(200).json({ message: 'Livre modifié avec succès !' })
                                console.log('Image mise à jour avec succès !');  
                                 } )
                                .catch((error) => res.status(400).json({ message: 'Erreur lors de la modification du livre' }));
            }
            })  
        
        .catch((error) => res.status(500).json({ message: 'Erreur lors de la modification du livre' }));
};
   

    

exports.deleteBook=(req,res,next)=>{
    Book.findOne({_id: req.params.id})
    .then(book =>{
        if(book.userId != req.auth.userId){
            res.status(401).json({message:'non-autorise'})
        }else{
            const bookName = book.imageUrl.split('/images/')[1]
            fs.unlink(`images/${bookName}`,()=>{
                Book.deleteOne({_id: req.params.id})
                .then(()=>res.status(200).json({message:'livre supprime'}))
                .catch(error => res.status(401).json({error}))  
            })
        }
    })
    .catch((error)=>res.status(500).json({error}))
}

exports.createBook=(req,res,next)=>{
    const bookObjet = JSON.parse(req.body.book) 
    delete bookObjet._id
    delete bookObjet._userId 

//optimise la taille de photo
const optimisedPhotoPath = `images/optimisezd_${req.file.filename}`

sharp(req.file.path)  
    .resize(800)  
    .toFormat('jpeg') 
    .jpeg({ quality: 80 }) 
    .toFile(optimisedPhotoPath)  
    .then(()=>{
        const book = new Book({
            ...bookObjet,
            userId:req.auth.userId, 
            imageUrl: `${req.protocol}://${req.get('host')}/${optimisedPhotoPath}` // get('host')
    
        })
        console.log('UserId Auth:', req.auth.userId);
        console.log('Book Object:', bookObjet);
        book.save() 
        .then(()=>{res.status(201).json({message:'livre cree'})})
        .catch((error)=>{res.status(400).json({error})}) 
    })
    .catch((error)=>res.status(500).json({error:'erreur lors de l\'optimisation de photo' }))
    

}

exports.addNote = (req,res,next)=>{
    const bookId = req.params.id
    const userId = req.auth.userId
    
    const newNote = {
        userId:userId,
        grade: req.body.rating
    }

    Book.findOne({_id: bookId})
    .then(book=>{
        if(!book){return res.status(404).json({message:'livre non trouvé'})}
        const ifRatingExiste = book.ratings.find(rating=> rating.userId === userId)// verifier si utilisateur a deja noté
        if(ifRatingExiste) {
            return res.status(400).json({message:'vous avez déjà noté ce livre'})
        }
        book.ratings.push(newNote)

        const quantiteRatings = book.ratings.length  
        const totalRatings = book.ratings.reduce((sum,rating)=> sum+rating.grade,0)
        book.averageRating = totalRatings/quantiteRatings  

        book.save()
        .then(updateBook=>res.status(200).json(updateBook))
        .catch((error)=>res.status(500).json({error})) 
    
    })
    .catch((error)=>res.status(500).json({error})) 

}