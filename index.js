var path=require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var low=require('lowdb');

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