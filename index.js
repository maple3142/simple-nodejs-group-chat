var path=require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var low=require('lowdb');
var db=low('./talk/main.json');

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(session({
	name: 'tmp',
    secret: make(),
	cookie: { maxAge: 60 * 1000 },
	resave: true,
	saveUninitialized: true
}));

app.get('/',(req,res)=>{
    res.render('new.ejs');
});
app.post('/new',(req,res)=>{
    var now=Date.now();
    db.get('list').push({id: now,secret: req.body.secret,auth: req.body.secret!=''}).value();
    fs.closeSync(fs.openSync('./talk/'+now+'.json', 'w'));//create file
    res.redirect('../talk/'+now);
});
app.get('/talk/:id',(req,res)=>{
    if(getid(req.params.id)){
        if(req.session['id'+req.params.id] || !getid(req.params.id).auth){
            res.render('talk.ejs',{id: req.params.id,msg: (low('./talk/'+req.params.id+'.json').get('msg').value()||[]) });
        }
        else{
            res.render('talkauth.ejs',{id: req.params.id});
        }
    }
    else res.redirect('/');
});
app.post('/talk/:id/auth',(req,res)=>{
    if(getid(req.params.id)){
        var obj=getid(req.params.id);
        if(obj){
            if(obj.secret==req.body.secret){
                req.session['id'+req.params.id]=true;
            }
        }
        res.redirect('/talk/'+req.params.id);
    }
    else res.redirect('/');
});
app.post('/talk/:id/new',(req,res)=>{
    if(getid(req.params.id)){
        if(req.session['id'+req.params.id] || !getid(req.params.id).auth){
            var talkdb=low('./talk/'+req.params.id+'.json');
            if(!talkdb.get('msg').value())
                talkdb.set('msg',[]).value();
            talkdb.get('msg').push({text: req.body.msg,sender: req.connection.remoteAddress.split(':').pop()}).value();
        }
        res.redirect('/talk/'+req.params.id);
    }
    else res.redirect('/');
});
app.get('/talk/:id/delete',(req,res)=>{
    if(req.session['id'+req.params.id] || !getid(req.params.id).auth){
        fs.unlink('./talk/'+req.params.id+'.json');
        var list=db.get('list').value();
        db.get('list').remove(getid(req.params.id)).value();
        res.redirect('/');
    }
    else
        res.redirect('/talk/'+req.params.id);
});


app.listen(80,()=>console.log('server started'));
function getid(id){
    var list=db.get('list').value();
    var exist=false;
    var i;
    for(i in list){
        if(list[i].id==id){
            exist=true;
            break;
        }
    }
    return (exist?list[i]:null);
}
function make(){
    return Math.random().toString(36).substring(7)+Math.random().toString(35).substring(7)+Math.random().toString(34).substring(7)+Math.random().toString(33).substring(7);
}