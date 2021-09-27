var express=require('express')
const pool=require('./mysqlconnection')
const upload=require('./upload')
const ip=require('@supercharge/request-ip');
const fs=require('fs')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
var router=express.Router()
router.get('/logout',function(req,res){
    localStorage.removeItem("admin")
    a=ip.getClientIp(req)
    // localStorage.removeItem(a)
    pool.query('delete from userloginstatus where (ipaddress=?)',[a],function(error,result){
        if(error){console.log(error)}  
      })
    res.redirect('/assignment/Login')
})
router.get('/userlogout',function(req,res){
    a=ip.getClientIp(req)
    // localStorage.removeItem(a)
    pool.query('delete from userloginstatus where (ipaddress=?)',[a],function(error,result){
        if(error){console.log(error)}  
      })
    res.redirect('/assignment/');
})
router.get('/signUp',function(req,res){
    a=ip.getClientIp(req);
    pool.query('select * from userloginstatus where ipaddress=?',[a],function(error,result){
        if(error){console.log(error)}
        else if(result.length==0){
            res.render('signup')
        }
        else{
            if(result[0].name=="admin"){
                a="/assignment/adminlogin?t="+cryptr.encrypt('admin');
            }
            else{
                a="/assignment/?a="+cryptr.encrypt(result[0].id)
            }
            res.redirect(a);
        }
    })
})
router.get('/Login',function(req,res){
    // a=ip.getClientIp(req)
    // a=localStorage.getItem(a)
    // if(a){
    //     a="/assignment/?a="+(JSON.parse(a).id);
    //     res.redirect(a)
    // }
    // else{
    //     res.render('login',{status:true});
    // }
    a=ip.getClientIp(req);
    pool.query('select * from userloginstatus where ipaddress=?',[a],function(error,result){
        if(error){console.log(error)}
        else if(result.length==0){
            res.render('login',{status:true});
        }
        else{
            if(result[0].name=="admin"){
                a="/assignment/adminlogin?t="+cryptr.encrypt('admin');
                res.redirect(a);
            }
            else{
            a="/assignment/?a="+cryptr.encrypt(result[0].id)
            res.redirect(a);
            }
    }
    })
})
router.get('/adminprofile',function(req,res){
    var a=localStorage.getItem('admin')
    if(a){
    res.render('adminprofile',{data:JSON.parse(a)})}
    else{
        res.redirect('/assignment/Login')
    }
})
router.get('/studentdeatils',function(req,res){
    var a=localStorage.getItem('admin')
    if(a){
        pool.query('select u.*,(select count(s.order) from submmision s where s.studentid=u.id ) as number from user u',function(error,result){
            if(error){
                console.log(error)
                res.redirect('/adminprofile')
            }
            else{
                    res.render('students',{data:result})
            }
        })

    }
    else{
        res.redirect('/assignment/Login')
    }
})
router.get('/assignmentdetails',function(req,res){
    var a=JSON.parse(localStorage.getItem('admin'))
    if(a){
        pool.query('select * from assignment where(faculty=?)',[a.name],function(error,result){
            if(error){
                console.log(error)
                res.redirect('/adminprofile')
            }
            else{
                res.render('assignment',{data:result})
            }
        })

    }
    else{
        res.redirect('/assignment/Login')
    }
})
router.get('/submmision',function(req,res){
    var a=JSON.parse(localStorage.getItem('admin'))
    if(a){
        pool.query('select s.order,s.assignmentid,s.marks,s.studentid,s.picture,s.dateofsubmmision,c.faculty from submmision s,assignment c where(s.assignmentid=c.id and c.faculty=?)',[a.name],function(error,result){
            if(error){
                console.log(error)
                res.redirect('/adminprofile')
            }
            else{
                res.render('assignmentsub',{data:result})
            }
        })

    }
    else{
        res.redirect('/assignment/Login')
    }
})
router.get('/delete',function(req,res){
    var a=JSON.parse(localStorage.getItem('admin'))
    if(a){
        pool.query('delete from user where(id=?)',[req.query.b],function(error,result){
            console.log(error)
            res.redirect('/assignment/studentdeatils')
        })
    }
})
router.get('/delete2',function(req,res){
    var a=localStorage.getItem('admin')
    if(a){
        pool.query('delete from assignment where(id=?)',[req.query.b],function(error,result){
            console.log(error)
            res.redirect('/assignment/studentdeatils')
        })
    }
})
router.get('/profile',function(req,res){
    id1=req.query.a
    try{
    var id=cryptr.decrypt(id1)
    pool.query('select u.*,(select count(s.order) from submmision s where s.studentid=u.id ) as number ,(select sum(p.marks) from submmision p where p.studentid=u.id) as score from user u where(id=?)',[id],function(error,result){
        if(error){
            console.log(error)
            a="/assignment/?a="+id1
            res.redirect(a)
        }
        else{

             res.render('profile',{id:id1,data:result[0],s:true})
        }
    })
}
        catch(e){
            var a=localStorage.getItem('admin')
            if(a){
                pool.query('select u.*,(select count(s.order) from submmision s where s.studentid=u.id) as number from user u where(id=?)',[id1],function(error,result){
            if(error){
                console.log(error)
                a="/adminprofile"
                res.redirect(a)
            }
            else{
                    res.render('profile',{id:id1,data:result[0],s:false})
                }
        })
    }
        else{
            res.redirect('/assignment/Login')
        }  
    }
    
})
router.get('/',function(req,res){
    // a=ip.getClientIp(req)
    // a=localStorage.getItem(a)
    a=ip.getClientIp(req);
    pool.query('select * from userloginstatus where ipaddress=?',[a],function(error,result){
        if(error){console.log(error)}
        else if(result.length==1){
            // a="/assignmnet/?a="+cryptr.encrypt(result[0].id)
            // res.redirect(a);
            id1=cryptr.encrypt(result[0].id)
            id=(result[0].id)
        }
        else{
            try{
            id1=req.query.a
            id=cryptr.decrypt(req.query.a)
            }
            catch(error){
                id1=undefined
                id=undefined
            }
        }
    try{
        // try {
            // id1=req.query.a
            // id=cryptr.decrypt(req.query.a)
        // } catch (error) {
            // // id1=JSON.parse(a).id
            // id=cryptr.decrypt(JSON.parse(a).id)
        // }
        pool.query('select s.*,(select a.faculty from assignment a where a.id=s.assignmentid) as faculty,(select b.enddate from assignment b where b.id=s.assignmentid) as enddate,(select c.picture from assignment c where c.id=s.assignmentid) as ass,(select d.name from assignment d where d.id=s.assignmentid) as name from submmision s where(s.studentid=?)',[id],function(error,result){
            if(error){
                console.log(error)
                res.render('home',{id:undefined})
            }
            else{
                res.render('home',{id:id1,data:result});
            }
        })
    }
    catch(error){
        console.log(error)
        
        res.render('home',{id:undefined,name:undefined});
    }
})
})
router.get("/marks",function(req,res){
    var a=localStorage.getItem('admin')
    if(a){
        var t=req.query.marks;
        if(t==undefined){
            res.render('uploadmarks',{s:true,order:req.query.a})
        }
        else{
            pool.query('UPDATE `submmision` SET `marks` = ? WHERE (`order` = ?)',[parseInt(t),req.query.a],function(error,result){
                if(error){
                    console.log(error)
                    a="/assignment/marks?a="+req.query.a;
                    res.redirect(a);
                }
                else{
                    res.redirect('/assignment/submmision');
                }
            })
        }
    }
})
router.post('/signup',function(req,res){
    var name=req.body.firstname+" "+req.body.lastname
    var uid=(req.body.uid)
    var branch=req.body.branch
    var password=cryptr.encrypt(req.body.passworduser)
    ipadd=ip.getClientIp(req);
    pool.query('insert into userloginstatus (ipaddress, name, id) values(?,?,?)',[ipadd,"user",uid],function(error,result){
        if(error){console.log(error)}
    })
    pool.query('insert into user (id, name, branch, password) values(?,?,?,?)',[uid,name,branch,password],function(error,result){
        if(error){
            console.log(error)
            res.render('signup')
        }
        else{
            var a='/assignment/?a='+cryptr.encrypt(uid)
            res.redirect(a)
        }
    })
})
router.get('/adminlogin',function(req,res){
    var t=cryptr.decrypt(req.query.t)
    if(t=="admin"){
    var a=localStorage.getItem('admin')
    if(a){
        res.render('dashboard',{data:JSON.parse(a)})
    }
    else{
        res.redirect('/assignment/Login')
    }
}
else{
    res.redirect('/assignment/Login')
}
})
router.post('/login',function(req,res){
    var id=req.body.uid
    var pass=req.body.pass
    pool.query('delete from userloginstatus where (id=?)',[id],function(error,result){
      if(error){console.log(error)}  
    })
    pool.query('select * from admin where(id=? and password=?)',[id,pass],function(error,result){
        if(error){
            res.render('login',{status:false,msg:"Server Error.........."})
        }
        else if(result.length==1){
            localStorage.setItem("admin",JSON.stringify(result[0]))
            ipadd=ip.getClientIp(req)
            pool.query('insert into userloginstatus (ipaddress, name, id) values(?,?,?)',[ipadd,"admin",id],function(error,result){
                if(error){console.log(error)}
            })
            res.render('dashboard',{data:result[0]})
        }
        else{
            pool.query('select * from user where(id=?)',[id],function(error,result){
                if(error){
                    res.render('login',{status:false,msg:"Server Error......"})
                }
                else if(result.length==0 || cryptr.decrypt(result[0]["password"])!=pass){
                    res.render('login',{status:false,msg:"Invalid Scholar Id or Password"})
                }
                else{
                    ipadd=ip.getClientIp(req)
                    pool.query('insert into userloginstatus (ipaddress, name, id) values(?,?,?)',[ipadd,"user",id],function(error,result){
                        if(error){console.log(error)}
                    })
                    // a=ip.getClientIp(req)
                    // localStorage.setItem(a,JSON.stringify({id:cryptr.encrypt(id)}))
                    a="/assignment/?a="+cryptr.encrypt(id);
                    res.redirect(a);
                }
            })}
    })
})
router.get('/fetch',function(req,res){
    var id=req.query.id
    pool.query('select * from user where(id=?)',[id],function(error,result){
        if(error){
            res.status(500).json([])
        }
        else{
            res.status(200).json(result)
        }
    })
})
router.get('/afetch',function(req,res){
    var id=req.query.id
    pool.query('select d.studentid,(select c.faculty from assignment c where c.id=d.assignmentid) as faculty from deletedrecord d where d.assignmentid=?',[id],function(error,result){
        if(error){
            console.log(error)
            res.status(500).json([])
        }
        else{
            res.status(200).json(result)
        }
    })
})
router.get('/update',function(req,res){
    var id=req.query.id
    pool.query('update user set password=? where(id=?)',[cryptr.encrypt(req.query.pass),id],function(error,result){
        if(error){
            res.status(500).json([])
        }
        else{
            res.status(200).json(result)
        }
    })
})
router.get('/addassignment',function(req,res){
    var a=JSON.parse(localStorage.getItem('admin'))
    if(a){
    res.render('addassignment',{s:true,aname:a.name});}
    else{
        res.redirect('/assignment/Login')
    }
})
router.post('/add',upload.single('paper'),function(req,res){

    var admin=JSON.parse(localStorage.getItem('admin'))
    if(admin){
    var a=req.file.originalname
file=req.file.filename
a=a.split('.')
if((a[a.length-1])=="pdf"){
    id=req.body.id
    aname=req.body.aname
    fname=req.body.fname
    enddate=req.body.enddate
    pool.query('insert into assignment (id, name, enddate, picture, faculty) values(?,?,?,?,?)',[id,aname,enddate,file,fname],function(error,result){
        if(error){
            var a="./public/images/"+file
            fs.unlinkSync(a)
            res.render('addassignment',{s:false,msg:"Server Error......",aname:admin.name});
        }
        else{
            var a='/assignment/adminlogin?t='+cryptr.encrypt('admin')
            res.redirect(a)
        }
    })
}
else{
    var a="./public/images/"+file
    fs.unlinkSync(a)
    res.render('addassignment',{s:false,msg:"Invalid File Format",aname:admin.name});
}}
else{
    res.redirect('/assignment/Login')
}
})
router.get('/submitassignment',function(req,res){
    var id=cryptr.decrypt(req.query.a)
    var id1=(req.query.a)
    pool.query('select * from assignment where id not in (select assignmentid from submmision where studentid=?)',[id],function(error,result){
        if(error){
            console.log(error)
        }
        else{
        res.render('submitassignment',{data:result,id:id1})}
    })
})
router.post('/upload',upload.single('paper'),function(req,res){
var a=req.file.originalname
file=req.file.filename
a=a.split('.')
if((a[1])=="pdf"){
    id=req.body.id
    aid=req.body.aid
        d=new Date()
        pool.query('insert into submmision (studentid, assignmentid, dateofsubmmision, picture) values(?,?,?,?)',[cryptr.decrypt(id),aid,d,file],function(error,result){
        if(error){
            var a="./public/images/"+file
            fs.unlinkSync(a)
            a="/assignment/submitassignment?a="+id
            res.redirect(a)
        }
        else{
            a="/assignment/submitassignment?a="+id
            res.redirect(a)
        }
    })
}
else{
    var a="./public/images/"+file
    fs.unlinkSync(a)
    a="/assignment/submitassignment?a="+id
    res.redirect(a)
}
})
router.get('/updateassignment',function(req,res){
    var a=localStorage.getItem('admin')
    if(a){
    pool.query('select * from assignment where id=?',[req.query.b],function(error,result){
        if(error){
            console.log(error)
        }
        else{
            res.render('updateassignment',{data:result[0],s:true})
        }
    })}
    else{
        res.redirect('/assignment/Login')
    }
})
router.post('/updatea',function(req,res){
    a=localStorage.getItem('admin')
    if(a){
    var aname=req.body.aname
    var id=req.body.id
    var fname=req.body.fname
    var enddate=req.body.enddate
    var pid=req.body.pid
    var pic=req.body.pic
    var btn=req.body.btn
    if(btn=="Update"){
        pool.query('update assignment set id=?,name=?,faculty=?,enddate=? where( id=?)',[id,aname,fname,enddate,pid],function(error,result){
            if(error){
                console.log(error)
            }
            else{
                res.redirect("/assignment/assignmentdetails")
            }
        })
    }
    else{
        pool.query('select * from submmision where assignmentid=?',[id],function(error,result){
            result.map((item,index)=>{
                pool.query('insert into deletedrecord (assignmentid, studentid, faculty, dateofsubmmision) values(?,?,?,?)',[id,item.studentid,fname,item.dateofsubmmision],function(error,result){
                 if(error){
                     console.log(error)
                 }   
               else{
                a="./public/images/"+item.picture
                fs.unlinkSync(a)                     
                 }
                })
            })
        })
        pool.query('delete from submmision where assignmentid=?',[id],function(error,result){
            if(error){
                console.log(error)
            }
        })
        pool.query('delete from assignment where id=?',[pid],function(error,result){
            if(error){
                console.log(error)
            }
            else{
                a="./public/images/"+pic
                fs.unlinkSync(a)
                res.redirect("/assignment/assignmentdetails")
            }
        })
    }}
    else{
        res.redirect('/assignment/Login')
    }
})
router.get('/updateimage',function(req,res){
    a=localStorage.getItem('admin')
    if(a){
    var b=req.query.b
    res.render('updateimage',{id:b,p:req.query.p,s:true})
}
else{
    res.redirect('/assignment/Login')
}
})
router.post('/updatepdf',upload.single('paper'),function(req,res){
    a=localStorage.getItem('admin')
    if(a){
    var id=req.body.id
    var pic=req.body.pic
var a=req.file.originalname
file=req.file.filename
if((a.split('.')[1])=="pdf"){
    pool.query('update assignment set picture=? where id=?',[req.file.filename,id],function(error,result){
        if(error){
            var a="./public/images/"+file
            fs.unlinkSync(a)
            res.render('updateimage',{id:id,p:pic,s:false,msg:"Server Error......"})
            console.log(error)
        }
        else{
            a="./public/images/"+pic
            if(pic!=req.file.filename){
            fs.unlinkSync(a)}
            a="/assignment/assignmentdetails"
            res.redirect(a)
        }
    })
}
else{
    var a="./public/images/"+file
    fs.unlinkSync(a)
    res.render('updateimage',{id:id,p:pic,s:false,msg:"Invalid File Format"})
    
}}
else{
    res.redirect('/assignment/Login')
}
})
router.get('/deletedassignment',function(req,res){
    a=JSON.parse(localStorage.getItem('admin'))
    if(a){
        pool.query('select * from deletedrecord  where faculty=?',[a.name],function(error,result){
            if(error){
                console.log(error)
            }
            else{
                res.render('deleteassignmentrecord',{data:result})
            }
        })
    }
    else{
        res.redirect('/assignment/Login')
    }
})
module.exports=router;