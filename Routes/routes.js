const express=require('express')
const userController=require('../controller/userController')
const bookController=require('../controller/bookController')
const authMiddleware=require('../Middlewares/authMiddleware')
const adminauthMiddleware=require('../Middlewares/adminAuthMiddleware')

const multerMiddleware=require('../Middlewares/multerMiddleware')

//to set up routes outside express server,create object for router class in express
const router=new express.Router()

//register
router.post('/register',userController.registerController)
router.post('/login',userController.loginController)
router.post('/google-login',userController.googleLogin)
router.get('/homebooks',bookController.getHomePageBookController)

//---------------------authorized user-------------------------

router.put('/user/edit/:id',authMiddleware,multerMiddleware.single('picture'),userController.userEditController)
router.post('/add-book',authMiddleware,multerMiddleware.array('uploadImages',3),bookController.addBookController)
router.get('/all-books',authMiddleware,bookController.getBooksPageBookController)
router.get('/user-books',authMiddleware,bookController.getUserBookController)
router.get('/bought-books',authMiddleware,bookController.getUserBoughtBookController)
router.get('/single-book/:id',authMiddleware,bookController.getSingleBookController)
router.delete('/remove-book/:id',authMiddleware,bookController.removeBookController)
router.get('/make-payment/:id',authMiddleware,bookController.bookpaymentController)
router.post('/verify-payment',bookController.verifyPayementController)

//get book via ai
router.post('/books-ai',bookController.generateBookAbstractController)

//---------------------admin--------------------
router.get('/books',adminauthMiddleware,bookController.getAllBooksController)
router.put('/book-update/:id',adminauthMiddleware,bookController.approveBooksController)
router.get('/all-users',adminauthMiddleware,userController.getAllUsersController)


module.exports=router