import { Router } from "express";
import { userRegister } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route("/register").post(
    
    upload.fields(
        {
            name:"avatar",
            maxcount:"1"
        },
        {
            name:"coverImage",
            maxcount:"1"
        }
    ),
    
    userRegister)




export default router
