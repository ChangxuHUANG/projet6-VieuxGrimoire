const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config') 

const stuffCtrl = require('../controller/stuff')

router.get('/', stuffCtrl.getAllBooks) 
router.post('/',auth,multer,stuffCtrl.createBook) 
router.post('/:id/rating', auth, stuffCtrl.addNote)
router.get('/bestrating', stuffCtrl.getBestRating) //route specifique avant route dynamique
router.get('/:id', stuffCtrl.getOneBook)  

 
   
router.put('/:id',auth,multer,stuffCtrl.modifyBook) 
router.delete('/:id',auth,stuffCtrl.deleteBook) 

module.exports = router   