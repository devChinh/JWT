const bcrypt = require('bcrypt') // là thư viện triển khai hàm băm mật khẩu
//hasing password
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const { use } = require('../routes/auth')

dotenv.config()

let refreshTokens = []
const authController = {
    // Register
    registerUser : async(req, res) => {
        try {
          const salt = await bcrypt.genSalt(10)
          // lưu trữ hash trong mật khẩu db
          const hashed = await bcrypt.hash(req.body.password , salt) 
          
          // Create new user 
          const newUser = await new User({
            username : req.body.username,
            email : req.body.email,
            password : hashed,
          })

          // save to database
          const user = await newUser.save()
          res.status(200).json(user)
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // tạo try cập token 
    generateAcsessToken : (user) => {
        // tạo 1 jwt bằng cách sử dụng phương thức sign
        return jwt.sign(
            //đầu tiên là thông tin đi kèm vào token khi tạo một JWT
            {
                id : user.id,
                admin : user.admin
            },
            process.env.JWT_ACCESS_KEY , // tiếp theo là mã bí mật  giúp JWT an toàn hơn
            {expiresIn : "30d"} // tiếp theo là thời gian mà mã token này hết hạn , thì nếu như mà token này
                                        // bị đánh cắp thì 30s nó sẽ tự động bị xoá , và mình sẽ có 1 cái gọi là
                                        // refreshtoken để tạo một token mới
        )
    },
    // lên trang trủ jwt để xem mã token chứa thông tin gì

    // tạo refresh token , sau một thời gian thì cái mã acsesstoken kia hết hạn thì phải tạo một token
    // mới để gán cho người dùng 
    generateRefreshToken : (user) => {
        return jwt.sign({
            id : user.id,
            admin : user.admin
        },
        process.env.JWT_REFRESH_KEY ,// mã bí mật 
        {expiresIn : '30d'} 
        )
    } ,

    // login 
    loginUser : async (req, res) => {
        try {
            console.log('============= req',req)
            const user = await  User.findOne({username : req.body.username}) // tìm user trong db

            // khác user trong db thì báo lỗi
            if(!user){
                res.status(404).json('Wrong username');
            }

            // hàm compare so sánh mk trong db
            const validPassword = await bcrypt.compare(
                req.body.password, // mk vừa nhập
                user.password // mk hash trong db 
            )

            // sai password thì báo lỗi
            if(!validPassword){
                res.status(400).json("wrong password")
            }
          
            // khi validate dữ liệu xong 
            if(user && validPassword){
                
               const accessToken =  authController.generateAcsessToken(user);
                const refreshToken = authController.generateRefreshToken(user);
                refreshTokens.push(refreshToken);
                // lưu vào cookie
                res.cookie("refreshToken" // tên của dữ liệu cookie
                 , refreshToken // dữ liệu muốn lưu 
                 , { // các options của cookie
                    httpOnly : true , 
                    path : "/",
                    sameSite : "Strict", // ngăn chặn tấn công
                    secure : false 
                })

                const {password , ...others} = user._doc; // data return not have passworld
                return  res.status(200).json({...others , accessToken})
            }

        } catch (error) {
            res.status(500).json(error);
        }
    },

    requestRefreshToken:  async (req, res) => {
         // lấy refresh token từ user
         const refreshToken = req.cookies.refreshToken;
         if(!refreshToken) return req.status(401).json('you are not authenticated')
         if(!refreshTokens.includes(refreshToken)){
            return res.status(403).json('refresh token is not valid')
         }
          jwt.verify(refreshToken , process.env.JWT_REFRESH_KEY , (err , user) => {
            if(err){
                console.log('============= err',err)
            }
            refreshTokens = refreshTokens.filter(token => token !== refreshToken)
            // create a new access token , refreshToken
            const newAccessToken = authController.generateAcsessToken(user)
            const newRefreshToken = authController.generateRefreshToken(user)
            refreshTokens.push(newAccessToken)
            // lưu vào cookie
            res.cookie("refreshToken" // tên của dữ liệu cookie
            , newRefreshToken // dữ liệu muốn lưu 
            , { // các options của cookie
                httpOnly : true , 
                path : "/",
                sameSite : "Strict", // ngăn chặn tấn công
                secure : false 
            })
            res.status(200).json({accessToken : newAccessToken})
          })
    },

    userLogout : async (req, res) => {
        res.clearCookie("refreshToken")
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken)
        res.status(200).json("log out !!!!")
    }
}

// thì khi mà không có JWT thì  đăng nhập ngta  chỉ cần mò name , passwork giống của bạn là ngta 
// vào được tài khoản của bạn rồi
// JWT là mỗi khi mình đăng nhập vào nó sẽ cung cấp cho mình một mã token như mà 1 cái CCCD 

// các cách lưu trữ token 
// 1 : lưu vào localStorage
// dễ bị tấn công bởi XSS
// 2 lưu vào cookies
// 3 lưu vào redux store -> access token
// httponly cookies -> refreshtoken

module.exports = authController;