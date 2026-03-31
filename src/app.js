 import express from "express"
 import cors from "cors"
 import cookieParser from "cookie-parser";


 const app=express();
  
  app.use(express.json({limit:"20kb"}));
  app.use(express.urlencoded({extended:true,limit:"20kb"}));
  app.use(express.static("public"));

  app.use(cookieParser())

  app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true

    }
  ))

  //router import

  import userRouter from "./routes/user.routes.js"

  //routes declearation

  app.use("/api/v1/users",userRouter)

   // http:localhost:8000/api/v1/users/...



 export { app}



//  import express from "express"
// import cors from "cors"
// import cookieParser from "cookie-parser";

// const app = express();

// // ✅ FIRST: middleware
// app.use(express.json({ limit: "20kb" }));
// app.use(express.urlencoded({ extended: true, limit: "20kb" }));
// app.use(express.static("public"));
// app.use(cookieParser());

// // ✅ FIX this also (small bug)
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true   // ❗ small 'c'
// }));

// // router import
// import userRouter from "./routes/user.routes.js"

// // ✅ THEN routes
// app.use("/api/v1/users", userRouter);

// // http://localhost:8000/api/v1/users/...

// export { app }