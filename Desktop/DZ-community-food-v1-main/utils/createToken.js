const jwt =require('jsonwebtoken')

const GENERATE_TOKEN =(paylod)=>{
const token = jwt.sign(paylod,process.env.JWT_SECRET,{expiresIn : process.env.JWT_EXPIRES_IN})
return token;
}



module.exports ={GENERATE_TOKEN}