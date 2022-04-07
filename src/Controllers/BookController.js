const bookModel = require("../Models/BookModel")
const userModel = require("../Models/UserModel")
const mongoose = require('mongoose');
const ReviewModel = require("../Models/ReviewModel");
// const aws = require("aws-sdk")
const aws=require("../aws/aws")


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// aws.config.update(
//     {
//         accessKeyId: "AKIAY3L35MCRVFM24Q7U",
//         secretAccessKeyId: "qGG1HE0qRixcW1T1Wg1bv+08tQrIkFVyDFqSft4J",
//         region: "ap-south-1"
//     }
// )

// let uploadFile = async (file) => {
//     return new Promise( function(resolve, reject) {
//         //this function will upload file to aws and return the link
//         let s3 = new aws.S3({ apiVersion: "2006-03-01" }) //we will be using s3 service of aws
//           uploadFile(files[0])
//         var uploadParams = {
//             ACL: "public-read",
//             Bucket: "classroom-training-bucket", // HERE
//             Key: "radhika/" + file.originalname, // HERE "radhika/smiley.jpg"
//             Body: file.buffer
//         }

//       s3.upload(uploadParams, function (err, data) {
//             if (err) { 
//                 return reject({ "error": err }) 
//             }

//             console.log(data)
//             console.log(" file uploaded succesfully ")
//             return resolve(data.Location) // HERE
//           }
//         )

//     // let data= await s3.upload(uploadParams)
//     // if (data) return data.Location
//     // else return "there is an error"

//     }
//     )
// }


const createBook = async function (req, res) {
    try {
        const data = req.body
    
        //const { title, excerpt, userId, ISBN, category, subcategory, releasedAt, bookCover } = data
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "enter data in user body" })
        }
        if (!isValid(data.title)) {
            return res.status(400).send({ status: false, msg: "enter title in the body" })
        }
        if (!isValid(data.excerpt)) {
            return res.status(400).send({ status: false, msg: "enter excerpt in  body" })
        }
        if (!isValid(data.userId)) {
            return res.status(400).send({ status: false, msg: "enter userId" })
        }

        if (!isValidObjectId(data.userId)) {
            return res.status(400).send({ status: false, msg: "enter valid userId" })
        }
        const userid = await userModel.findById({ _id: data.userId })
        if (!userid) {
            return res.status(400).send({ status: false, msg: "given user is not present please enter valid userid" })
        }


        // const isISBN = await bookModel.findOne({ ISBN })
        // if (isISBN) {
        //     return res.status(400).send({ msg: "ISBN is already exists" })
        // }

        if (!isValid(data.ISBN)) {
            return res.status(400).send({ status: false, msg: "enter ISBN" })
        }

        const validISBN = await bookModel.findOne({ ISBN:data.ISBN })
        if (validISBN) {
            return res.status(400).send({ status: false, msg: "ISBN is already exist" })
        }
        if (!isValid(data.category)) {
            return res.status(400).send({ status: false, msg: "enter category" })
        }
        if (!isValid(data.subcategory)) {
            return res.status(400).send({ status: false, msg: "enter subcategory" })
        }

        const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

        if (!(dateRegex.test(data.releasedAt.trim()))) {
            res.status(400).send({ status: false, message: `Date should be in valid format` })
            return
        }

        const validTitle = await bookModel.findOne({ title:data.title })
        if (validTitle) {
            return res.status(400).send({ status: false, msg: "title is already exist" })
        }


        let files = req.files
        if (files && files.length>0) {
            //const uploadedFiles=[];
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            //for(const file of files){
            var uploadedFileURL = await aws.uploadFile(files[0]);
            //uploadedFiles.push(uploadedFileURL.Location)
        }
            //res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })

        
        else {
            res.status(400).send({ msg: "No file found" })
         }
        data.bookCover=uploadedFileURL;
        //let finalData={data,bookCover:uploadedFiles}
        const createDataBook = await bookModel.create(data)
        return res.status(201).send({ msg: "sucessfully created", data: createDataBook })
            
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const getBooksQuery = async function (req, res) {
    try {
        let filterquery = { isDeleted: false }
        let queryParams = req.query
        const { userId, category, subcategory } = queryParams
        if (userId || category || subcategory) {
            if (isValidRequestBody(queryParams)) {


                if (queryParams.userId && isValidObjectId(userId)) {
                    filterquery['userId'] = userId
                }

                if (isValid(category)) {
                    filterquery['category'] = category.trim()
                }

                if (isValid(subcategory)) {

                    filterquery['subcategory'] = subcategory.trim()

                }
            }

        }

        const bookss = await bookModel.findOne(filterquery)
        if (!bookss) {
            return res.status(404).send({ status: false, msg: "No books found" })

        }

        const books = await bookModel.find(filterquery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, releasedAt: 1, reviews: 1 })
        let sortedb = books.sort((a, b) => a.title.localeCompare(b.title));

        // const sortedb = books.sort()
        const count = books.length


        return res.status(200).send({ status: true, NumberofBooks: count, msg: "books list", data: sortedb })

    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}

// const getBookById = async function (req, res) {]
//     try {
//         const bookId = req.params.bookId
//         const getbook = await BookModel.findOne({ _id: bookId })
//         const reviewdata = await ReviewModel.find()
//         res.status(200).send({ status: true, message: "sucessfully", result: getbook, reviews: reviewdata })
//     } catch (error) {
//         res.status(500).send({ status: false, message: error.message });

//     }
// }

const getBookByPath = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if (!isValid(bookId)) {
            {
                res.status(400).send({ status: false, messege: "Please provide The bookid" });
                return
            }
        }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "enter valid bookId" })
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            res.status(404).send({ msg: "No Book found" })
        } else {
            // let booksId = book._id;
            // let title = book.title;
            // let excerpt = book.excerpt;
            // let userId = book.userId;
            // let ISBN=book.ISBN;
            // let category=book.category;
            // let subcategory=book.subcategory;
            // let reviews=book.reviews;
            // let releasedAt=book.releasedAt

            let allReviews = await ReviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

            if (!allReviews.length > 0) {
                let Data = {
                    _id: book._id,
                    title: book.title,
                    excerpt: book.excerpt,
                    userId: book.userId,
                    ISBN: book.ISBN,
                    category: book.category,
                    subcategory: book.subcategory,
                    reviews: book.reviews,
                    releasedAt: book.releasedAt,
                    // book,
                    reviewsData: []


                };
                res.status(200).send({ status: true, data: Data });
                return;
            } else {

                let Data = {

                    _id: book._id,
                    title: book.title,
                    excerpt: book.excerpt,
                    userId: book.userId,
                    ISBN: book.ISBN,
                    category: book.category,
                    subcategory: book.subcategory,
                    reviews: book.reviews,
                    releasedAt: book.releasedAt,
                    reviewsData: allReviews

                };
                res.status(200).send({
                    status: true,
                    message: `Successfully retrived all book data with reviews details`,
                    data: Data,
                });





            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}


const updateBooks = async function (req, res) {
    try {
        //let data = req.body
        let title = req.body.title
        let excerpt = req.body.excerpt
        let releasedAt = req.body.releasedAt
        let ISBN = req.body.ISBN
        let bookId = req.params.bookId

        const validTitle= await bookModel.findOne({title:title})
        if(validTitle){
            return res.status(400).send({status:false,msg:"title is already exist"})
        }

        const validISBN = await bookModel.findOne({ ISBN: ISBN })
        if (validISBN) {
            return res.status(400).send({ status: false, msg: "ISBN is already exist" })
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) {
            return res.status(404).send({ status: false, msg: "no book found" })
        } else {

        }
        let allbook = await bookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } },
            { new: true })

        return res.status(200).send({ data: allbook })



    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}


const deleteByPath = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let book = await bookModel.findOne({_id:bookId,isDeleted:false})
        if (book) {
            let allBooks = await bookModel.findOneAndUpdate(
                { _id: bookId, isDeleted: false }, //condition
                { isDeleted: true },  //update in data
                { new: true } // new: true - will give you back the updated document // Upsert: it finds and updates the document but if the doc is not found(i.e it does not exist) then it creates a new document i.e UPdate Or inSERT  
            )
            res.status(200).send("done")
        } else {
            res.status(404).send({ msg: "No Book found" })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}

module.exports.createBook = createBook
module.exports.getBooksQuery = getBooksQuery
module.exports.getBookByPath = getBookByPath
module.exports.updateBooks = updateBooks
module.exports.deleteByPath = deleteByPath