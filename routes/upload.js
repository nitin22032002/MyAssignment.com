var multer=require('multer');
var uid=require('generate-unique-id')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
var des=multer.diskStorage({
    destination:(req,file,path)=>{
        path(null,"public/images");
    },
    filename:(req,file,path)=>{
        id=req.body.id
        try{
            id=cryptr.decrypt(id)
        }
        catch(e){
            console.log(e)
        }
        if(id==undefined){
            var id=uid({
                length:10,
                includeSymbols:['@','$','!','^','&']
            })
        }
        path(null,(id+"."+file.originalname.split('.')[1]));}
})
var upload=multer({storage:des});
module.exports=upload;