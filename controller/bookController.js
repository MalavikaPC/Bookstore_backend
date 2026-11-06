const books = require('../Models/bookModel')
const stripe=require('stripe')(process.env.STRIPEKEY)
const {GoogleGenerativeAI}=require('@google/generative-ai')

exports.addBookController = async (req, res) => {
    console.log("inside add book controller");
    const { title, author, pages, imageUrl, price, discountPrice, abstract, publisher, isbn, language, catagory } = req.body

    const uploadImages = req.files.map(item => item.filename)

    const sellerEmail = req.payload
    console.log(title, author, pages, imageUrl, price, discountPrice, abstract, publisher, isbn, language, catagory, uploadImages, sellerEmail);

    const existingBook = await books.findOne({ title, sellerEmail })
    if (existingBook) {
        res.status(409).json("Book already exist...operation denied")
    }
    else {
        const newBook = await books.create({ title, author, pages, imageUrl, price, discountPrice, abstract, publisher, isbn, language, catagory, uploadImages, sellerEmail })
        res.status(200).json(newBook)
    }


}

//get latest 4 books
exports.getHomePageBookController = async (req, res) => {
    console.log("inside getHomePageBookController");

    const homebooks = await books.find().sort({ _id: -1 }).limit(4)
    res.status(200).json(homebooks)


}

//get all books apart from login user
exports.getBooksPageBookController = async (req, res) => {
    console.log("inside getBooksPageBookController");
    const loginUseMail = req.payload
    const searchKey=req.query.search
    const allbooks = await books.find({ sellerEmail: { $ne: loginUseMail } ,title:{$regex:searchKey,$options:"i"}})
    res.status(200).json(allbooks)


}

//display book uploaded by login user
exports.getUserBookController = async (req, res) => {
    console.log("inside getUserBookController");
    const loginUseMail = req.payload
    const userbooks = await books.find({ sellerEmail:loginUseMail  })
    res.status(200).json(userbooks)


}

//get user bought books
exports.getUserBoughtBookController = async (req, res) => {
    console.log("inside getUserBoughtBookController");
    const loginUseMail = req.payload
    const userboughtbooks = await books.find({ buyerEmail: loginUseMail  })
    res.status(200).json(userboughtbooks)


}

//get single books
exports.getSingleBookController = async (req, res) => {
    console.log("inside getSingleBookController");
    const {id} = req.params
    const bookDetails = await books.findById({_id:id})
    res.status(200).json(bookDetails)


}

//remove book
exports.removeBookController = async (req, res) => {
    console.log("inside removeBookController");
    const {id} = req.params
    const dltBook = await books.findByIdAndDelete({_id:id})
    res.status(200).json(dltBook)


}

//payment
exports.bookpaymentController=async(req,res)=>{
    console.log("inside bookpaymentController");
    const {id}=req.params
    const loginUserMail=req.payload
    const bookDetails=await books.findById({_id:id})
const session=await stripe.checkout.sessions.create({
    // payment_method_types:['card'],
    line_items:[
        {
            price_data:{
currency:'usd',
product_data:{
    name:bookDetails.title
},
unit_amount:Math.round(bookDetails.discountPrice*100)
            },
            quantity:1
        }
    ],
    mode:'payment',
    metadata:{
        bookId:id,
        buyerEmail:loginUserMail
    },
    success_url:'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url:'http://localhost:5173/cancel'
});
    console.log(session);
    res.status(200).json({checkoutURL:session.url})

    
}

exports.verifyPayementController=async(req,res)=>{
    console.log("inside verifyPayementController ");
    const {sessionId}=req.body
    const session=await stripe.checkout.sessions.retrieve(sessionId)
    if(session.payment_status=='paid')
    {
const bookid=session.metadata.bookId
const email=session.metadata.buyerEmail
const book=await books.findOne({_id:bookid})
book.status='Sold'
book.buyerEmail=email
await book.save()
res.status(200).json({message:"Payment Verified",book})
    }
    else{
        res.status(400).json("Payment not completed")
    }
}

//get all books 
exports.getAllBooksController = async (req, res) => {
    console.log("inside getAllBooksController");
    
    const allbooks = await books.find()
    res.status(200).json(allbooks)


}


//update book status
exports.approveBooksController = async (req, res) => {
    console.log("inside approveBooksController");
    const {id}=req.params
    const book = await books.findById({_id:id})
    book.status="Approved"
    await book.save()
    res.status(200).json(book)


}

//get book abstract
exports.generateBookAbstractController=async(req,res)=>{
    console.log("inside generateBookAbstractController");
    console.log("Received title:", req.body.title);
console.log("API key loaded:", !!process.env.GEMINI_API);
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API)
const {title}=req.body
const model=genAI.getGenerativeModel({
    model:'gemini-3.5-flash'

})
const result=await model.generateContent(`Give me a short abstarct of the book ${title} as plain text`)
console.log(result);
const reply=result.response

    res.status(200).json( {
        success:true,
        content:reply.candidates[0].content.parts[0].text
    })
}
