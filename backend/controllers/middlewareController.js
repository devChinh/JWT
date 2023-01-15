const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

// khi mà người dùng muốn làm một hành vi nào đó thì phải trải qua bước xác thực trước rồi
// mới cho người ta hành động

const middlewareController = {
    // verify the token - xác thực token
    verifyToken: (req, res, next) => {
        // lấy token từ người dung
        const token =  req.headers.token
        console.log('============= token',token)
        if(token){
            const accessToken = token.split(" ")[1]
            console.log('============= accessToken',accessToken)
            // verify
            jwt.verify(accessToken , process.env.JWT_ACCESS_KEY , (err , user) => {
                if(err){
                    // mã token sai hoặc hết hạn
                    res.status(403).json("token is not valid")
                }
                req.user = user;
                next(); // thoả mãn hết điều kiện trên thì mới đc đi tiếp 
            })
        }
        else{ 
            // chưa có mã token hoặc là chưa login
            res.status(401).json("you are not authorization")
        }
    },


    // chỉ có chính mình thì mới xoá được chính mình mà thôi , hoặc là admin thì có thể xoá
    // ai cũng đc
    verifyTokenAndAdminAuth : (req, res, next) => {
        middlewareController.verifyToken(req , res , () => {
            if(req.user.id == req.params.id || req.user.admin){
                next();
            }else{
                res.status(401).json("you are not  allow to delete other")
            }
        })
    }
}
module.exports = middlewareController

// Bearer token  : quy ước viết Bearer ở trước token của authorization
