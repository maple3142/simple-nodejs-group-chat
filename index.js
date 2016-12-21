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
	secret: 'EE5SwYstbe0ZIv5Zw5kZT6QWsPMEnQ3w0cT7nJK0wCsBriArb06YyTqqnlGu7h27tKN7VjiWiESa6ksLATsdeWUj7xMAzqDmlA7sU4e8tVOO41pgCaPYckJrKT8i5DL4',
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
    if(req.session['id'+req.params.id] || !getid(req.params.id).auth){
        res.render('talk.ejs',{id: req.params.id,msg: (low('./talk/'+req.params.id+'.json').get('msg').value()||[]) });
    }
    else{
        res.render('talkauth.ejs',{id: req.params.id});
    }
});
app.post('/talk/:id/auth',(req,res)=>{
    var obj=getid(req.params.id);
    if(obj){
        if(obj.secret==req.body.secret){
            req.session['id'+req.params.id]=true;
        }
    }
    res.redirect('/talk/'+req.params.id);
});
app.post('/talk/:id/new',(req,res)=>{
    if(req.session['id'+req.params.id] || !getid(req.params.id).auth){
        var talkdb=low('./talk/'+req.params.id+'.json');
        if(!talkdb.get('msg').value())
            talkdb.set('msg',[]).value();
        talkdb.get('msg').push({text: req.body.msg,sender: req.connection.remoteAddress}).value();
    }
    res.redirect('/talk/'+req.params.id);
});
app.get('/talk/:id/delete',(req,res)=>{
    if(req.session['id'+req.params.id] || !getid(req.params.id).auth){
        fs.unlink('./talk/'+req.params.id+'.json');
        var list=db.get('list').value();
        db.get('list').remove(getid(req.params.id)).value();
        res.redirect('/');
    }
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