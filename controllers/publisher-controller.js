const Publisher = require('./../models/publisher');
const Author = require('./../models/author');
const Authentication = require('../models/user');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports.getAll = async (req, res, next) => {
    try {
        let publishers = await Publisher.find()
        res.status(200).json({publishers: publishers})    
    } catch (error) {
        console.log(error)    
    }
}

// module.exports.getAdd = (req, res, next) => {
//     res.render('./publisher/add-publisher', {
//         title: "Add publisher"
//     })
// }

module.exports.postAdd = async (req, res, next) => {
    const { name, establishmentDate, street, city, postCode} = req.body;

    //console.log(req.body)
    try {
        let pub = await Publisher.findOne({user: req.userId})
        let aut = await Author.findOne({user: req.userId})
        if(pub || aut){
            const error = new Error("User can only have one author or publisher");
            error.statusCode = 401;
            throw error; 
        }
        await Publisher.create({name: name, establishmentDate: establishmentDate, user: req.userId, 
            address: {
                street: street,
                city: city,
                postCode: postCode}
            })
        let user = await Authentication.findByIdAndUpdate(req.userId, {status: "publisher"})    
        res.status(201).json({message: "Publisher created"})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err); 
    }

}

module.exports.getPublisher = async (req, res, next) => {
    const id = req.params.publisherId;

    try {
        const publisher = await Publisher.findById(id).populate('authors.author');
        const availableAuthors = await Author.find({ 
            _id: { $nin: publisher.authors.map(x => x.author) }
        });

        if(publisher) {
            // return res.render('./publisher/publisher-details', {
            //     publisher: publisher,
            //     title: publisher.name,
            //     availableAuthors: availableAuthors
            // });
            return res.status(200).json({publisher: publisher, availableAuthors: availableAuthors})
        } 
    } catch (error) {
        console.log(error);
    }
    
    res.redirect('/publishers');    
}

module.exports.deletePublisher = (req, res, next) => {
    const id = req.params.publisherId;
    //console.log(req.params)

    Publisher.findByIdAndDelete(id)
        .then(() => {
            res.redirect('/publishers')
        })
        .catch(err => console.log(err));
}

module.exports.addAuthor = async (req, res, next) => {
    const publisherId = req.params.publisherId;
    const authorId = req.body.authorId;

    const publisher = await Publisher.findById(publisherId);
    const author = await Author.findById(authorId);

    if(author && publisher){
        publisher.authors.push(author);
        await publisher.save();
        author.publishers.push(publisher);
        await author.save();
        //return res.redirect(`/publisher/${publisher.id}`)
        return res.status(201).json({message: "Author assaigned"})
    }
    //res.redirect('/publishers');    
    const error = new Error("Something went wrong!");
    error.statusCode = 401;
    next(error)
}

module.exports.addAuthors = async (req, res, next) => {
    const publisherId = req.params.publisherId;
    
    // ObjectId not comparing proprerly
    //const authorIds = req.body.authorIds.map( x => new ObjectId(x));
    const authorIds = req.body.authorIds    
   
    try {
        const publisher = await Publisher.findById(publisherId);
        if(!publisher){
            const error = new Error("Publisher not found.");
            error.statusCode = 401;
            throw error; 
        }
        publisher.authors = publisher.authors.map(x => {
            if(authorIds.includes(x.author.toString())){
                x.status = "Accepted"
            }
            return x;
        })
        await publisher.save();
        return res.status(201).json({message: "Authors assaigned"})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err); 
    }


    
    

    
        
}