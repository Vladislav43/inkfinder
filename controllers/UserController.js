import userService from "../services/UserService.js"
import * as dotenv from "dotenv"
import { validationResult } from "express-validator"
import { ApiError } from "../exceptions/apiError.js"
import User from "../model/User.js"

dotenv.config()

class UserController {
  async registration(req,res,next){
    try{
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return next(ApiError.BadRequests('Validation error , make sure your email is correct', errors.array())) 
      }
      const {email, password} = req.body
      const userData = await userService.registration(email,password)
      res.cookie('refreshToken',userData.refreshToken, {maxAge: 30*24*60*1000 , httpOnly : true})
      return res.json(userData)
    }catch(e){
      next(e);
    }
  }

  async login(req,res,next){
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
  }

  async logout(req,res,next){
    try{
      const {refreshToken} = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json(token)
    }catch(e){
      next(e);
    }
  }

  async activate(req,res,next){
    try{
      const activationLink = req.params.link
      await userService.activate(activationLink)
      return res.redirect(process.env.CLIENT_URL)
    }catch(e){
      next(e);
    }
  }

  async refresh(req,res,next){
    try{
      const {refreshToken} = req.cookies
      const userData = await userService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      return res.json(userData);
    }catch(e){
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
        const users = await userService.getAllUsers();
        return res.json(users);
    } catch (e) {
        next(e);
    }
}

async getUsersPosts(req, res, next) {
  try {
      const user = req.params.id
      const posts = await userService.getUsersPosts(user);
      return res.json(posts);
  } catch (e) {
      next(e);
  }
}

}

const userController = new UserController()

export default userController

