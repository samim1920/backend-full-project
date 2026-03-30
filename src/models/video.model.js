import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema=mongoose.Schema(
    {
        videofile:{
          type:String, //cludinary url
          required:true

        },
        thumbnail:{
          type:String, //cludinary url
          required:true

        },
        title:{
          type:String, 
          required:true

        },
        description:{
          type:String, 
          required:true

        },
        duration:{
          type: Number, //cludinary url
          required:true

        },
        views:{
          type:Number, //cludinary url
          default:0

        },
        isPublished:{
          type:Boolean, 
          default:true

        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate);
export const Video=mongoose.model("Video",videoSchema)



