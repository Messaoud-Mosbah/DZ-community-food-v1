const {check,body} =require('express-validator')
const USER = require('../../models/userModel')
const validatorMiddleware =require('../../middlewares/validatorMiddleware')



const registerValidator = [
check("userName")
.notEmpty().withMessage("username required")
.isLength({min : 3}).withMessage('username too short')
.custom (async(username) => {
    const user= await USER.findOne({userName: username})
        if(user) throw new Error("Username already exists")}),
    

    check('email')
    .notEmpty().withMessage("email required")
    .isEmail().withMessage("invalid email")
    .custom(async (email)=>{
        const user = await USER.findOne({email})
        if(user) throw new Error ("email already exist")
    }),
  
    check('password')
    .notEmpty().withMessage('password required')
    .isLength({min :8}).withMessage('password too short'),

    validatorMiddleware
    

]

const loginValidator = [
    body().custom(body=>{
        if(!body.email && !body.userName){
            throw new Error ('email or username are required')
        }
        return true;
    }),

    body('email').optional()
    .notEmpty().withMessage('email required')
    .isEmail().withMessage('email invalid'),

    body('userName').optional()
    .matches(/^[a-zA-Z][a-zA-Z0-9]*$/)
    .notEmpty().withMessage('userName required'),
   
    check('password')
    .notEmpty().withMessage('password required'),
    validatorMiddleware

]

module.exports = {registerValidator ,loginValidator }