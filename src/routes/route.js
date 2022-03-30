const express = require('express');
const router = express.Router();



const UserController = require("../Controllers/UserController")
const BookController=require("../Controllers/BookController")
const ReviewController=require("../Controllers/ReviewController")
const Middleware=require("../Middlewares/Auth")



router.post("/register",UserController.CreateUser)
router.post("/login",UserController.loginUser)
router.post("/books",Middleware.authentication,BookController.createBook)

router.get("/books",Middleware.authentication,BookController.getBooksQuery)

router.get("/books/:bookId",Middleware.authentication,BookController.getBookByPath)

router.put("/books/:bookId",Middleware.authentication,Middleware.authorisation,BookController.updateBooks)
router.delete("/books/:bookId",Middleware.authentication,Middleware.authorisation,BookController.deleteByPath)

router.post("/books/:bookId/review",ReviewController.createReview)
router.put("/books/:bookId/review/:reviewId",ReviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",ReviewController.deleteRevByPath)



module.exports=router;