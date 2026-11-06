const mongoose=require('mongoose')

const connection_string=process.env.DBConnectionString

mongoose.connect(connection_string).then((res)=>{
    console.log("server connected to mongoDB");
    
}).catch(err=>{
    console.log("connection failed");
    console.log(err);
    
    
})