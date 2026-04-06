import { Router } from "express";
import { refreshAccessToken, userLogin, userLogout, userRegister,
    ChangecurrentPassword, getcurrentuser, updateuser, 
    updateuseravatar, updateusercoverimage, 
    getwatchHistory} from "../controllers/user.controller.js";
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
router.route("/changecurrentpassword").post(veryfyJWT,ChangecurrentPassword)
router.route("/currentuser").get(veryfyJWT,getcurrentuser)
router.route("/udateuser").patch(veryfyJWT,updateuser)  // .patgh ksron akta user update hho66e tai

router.route("/updateavatar").patch(veryfyJWT,upload.single("avatar"),updateuseravatar)  // 2 ta middleware kron akta file upload hobe

router.route("/updatecoverimage").patch(veryfyJWT,upload.single("coverImage",updateusercoverimage))
router.route("/c/:username").get(veryfyJWT,getchalleldetails)
router.route("/history").get(veryfyJWT,getwatchHistory)




export default router
