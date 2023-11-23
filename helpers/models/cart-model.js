const mongoose = require('mongoose');
const collections=require('../../dbconfig/collections');
const objectId = mongoose.Types.ObjectId;
      
// const productSchema ={
//     // item: {
//     //   type:objectId,
//     //   ref: 'item' 
//     // },
//     // quantity: {
//     //   type: Number,
//     //   default: 1
//     // }
//   }
  
  const cartSchema = new mongoose.Schema({
    user: {
      type:objectId, 
      ref: 'User' 
    },
    products: [{}] // An array of product objects
  });
  

const userCart=mongoose.model(collections.user_cart,cartSchema);

module.exports = userCart;