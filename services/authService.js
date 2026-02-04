
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const {GENERATE_TOKEN} = require('../utils/createToken')
const bcrypt = require('bcryptjs')






const register = asyncHandler(async (req, res) => {
const {userName, email, password} = req.body;

const newuser = await User.create({
    userName,
    email,
    password
});

const token = await GENERATE_TOKEN({email : newuser.email , id: newuser._id ,  userName: newuser.userName  })
    res.status(201).json({status : 'success' ,data :{user :newuser , token : token}  })

})


const login = asyncHandler(async (req,res,)=>{

    const {userName, email , password} = req.body 
      if(!userName && !email || !password){
        return res.status(400).json({status : 'fail' , msg : 'email or username - and password are required '})
      }
//verify username/email
    const user = await User.findOne({$or: [{ email: email || null }, { userName: userName || null }] });
    if(!user){
        return res.status(400).json({status : 'fail' , msg : 'user not found'})
    }
//verify psw
    const matched =await bcrypt.compare(password ,user.password )
    if (!matched) {
        return res.status(400).json({status : 'fail' , msg : 'password incorrect'})
    }

const token =  GENERATE_TOKEN({email : user.email , id: user._id ,  userName: user.userName  })
return res.status(200).json({status : 'success' , msg:"you are log in now " , data :{token}  })
        
   

 

})

module.exports = { register ,login};