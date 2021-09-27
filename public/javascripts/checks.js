$(document).ready(function(){   
$('#uid').keyup(function(){
    var a=$('#uid').val()
    $.getJSON('/assignment/fetch',{id:a},function(data){
        if(data.length!=0){
            alert("This Scholar Number aleredy register")
            $('#uid').val("")
        }
    })
})
$('#aid').keyup(function(){
    var a=$('#aid').val()
    $.getJSON('/assignment/afetch',{id:a},function(data){
        if(data.length!=0){
            alert("This Assignment aleredy register")
            $('#aid').val("")
        }
    })
})
$('#passeye').click(function(){
    if(pass.type=='text'){
        passeye.innerHTML='&#128065;'
        pass.type='password';
    }
    else{
        passeye.innerHTML='<s>&#128065;</s>'
        pass.type='text';
    }
})
$('#cpasseye').click(function(){
    if(cpass.type=='text'){
        cpasseye.innerHTML='&#128065;'
        cpass.type='password';
    }
    else{
        cpasseye.innerHTML='<s>&#128065;</s>'
        cpass.type='text';
    }
})
$('#forgotlable').click(function(){
    var a=prompt("Enter Your Scholar Number");
    $.getJSON('/assignment/fetch',{id:a},function(data){
        if(data.length==0){
            alert("Invalid Scholar Number")
        }
        else{
            pass=prompt("Enter New Password")
            cpass=prompt("Enter Confirm Password")
            if(cpass==pass){
                $.getJSON('/assignment/update',{id:a,pass:pass},function(data){
                    alert("Password SuccessFully Update")
                })
            }
            else{
                alert("Password and Confirm Password Not match try again")
            }
        }
    })
    })
$('#signupbtn').click(function(){
    window.location.href="/assignment/signUp"
})
})