import { Router } from "express";
import { refreshAccessToken, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import { veryfyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route("/register").post(
    
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
   ] ),
    
    userRegister)

router.route("/login").post(userLogin)

//secured route

router.route("/logout").post(veryfyJWT,userLogout)
router.route("/refreshtoken").post(refreshAccessToken)


export default router
