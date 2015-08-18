
var fs = require("fs");
var ejs = require("ejs");
var express = require("express");

var app = express();

var bodyParser = require('body-parser');
var urlencodedBodyParser = bodyParser.urlencoded({extended: false});
app.use(urlencodedBodyParser);
var methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.listen(3000, function() {
	console.log("listening!");
});


var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('wiki.db');






app.get("/", function(req, res) {
	res.redirect("/wiki");
});


app.get("/wiki", function(req, res) {
	
	db.all("SELECT * FROM articles INNER JOIN authors ON articles.author_id = authors.author_id ORDER BY date_made DESC;", function(err, rows) {
		if (err) {
			console.log(err)
		}
		else {
			var template = fs.readFileSync("./views/index.html", "utf8");
			var html = ejs.render(template, {"rows":rows});
			res.send(html);
		}
	})





});


app.get("/wiki/new", function(req, res) {
	var template = fs.readFileSync("./views/new.html", "utf8");
	res.send(template);
});





app.get("/wiki/search/show", function(req, res) {
	var search = req.query.search;
	db.all("SELECT * FROM articles INNER JOIN authors ON articles.author_id = authors.author_id WHERE title='"+search+"' OR first_name='"+search+"' OR last_name='"+search+"'", function(err, rows) {
		if (err) {
			console.log(err);
		}
		else {
			var template = fs.readFileSync("./views/searchShow.html", "utf8");
			var html = ejs.render(template, {rows:rows});
			res.send(html);
		}
	})
});


app.get("/wiki/search", function(req, res) {
	var template = fs.readFileSync("./views/search.html", "utf8");
	res.send(template);
});


app.get("/wiki/category", function(req, res) {
	var template = fs.readFileSync("./views/category.html", "utf8");
	res.send(template);
});




app.get("/wiki/category/:id", function(req, res) {
	var category = req.params.id;
	db.all("SELECT * FROM articles INNER JOIN authors ON articles.author_id = authors.author_id WHERE category='"+category+"';", function(err, rows) {
		if (err) {
			console.log(err);
		}
		else {
			var template = fs.readFileSync("./views/showcat.html", "utf8");
			var html = ejs.render(template, {rows:rows});
			res.send(html);
		}
	})
});


app.get("/wiki/:id", function(req, res) {
	var id = req.params.id;
	db.get("SELECT * FROM articles INNER JOIN authors ON articles.author_id = authors.author_id WHERE id="+id, function(err, row) {
		if (err) {
			console.log(err);
		}
		else {
			var template = fs.readFileSync("./views/show.html", "utf8");
			var html = ejs.render(template, {row:row});
			res.send(html);
		}
	})
});


app.get("/wiki/:id/edit", function(req, res) {
	var id = req.params.id;
	db.get("SELECT * FROM articles INNER JOIN authors ON articles.author_id = authors.author_id WHERE id="+id, function(err, row) {
		if (err) {
			console.log(err);
		}
		else {
			var template = fs.readFileSync("./views/edit.html", "utf8");
			var html = ejs.render(template, {row:row});
			res.send(html);
		}
	}) 
});






app.put("/wiki/:id", function(req, res) {
	var id = req.params.id;
	var text = req.body.text;
	var date = new Date();
	var current_time = date.toUTCString();

	db.run("UPDATE articles SET article='"+text+"', date_edit='"+current_time+"' WHERE id="+id, function(err) {
		if (err) {
			console.log(err);
		}
	})
	res.redirect("/wiki/"+id); 
});



//creating a new article (and author)
app.post("/wiki", function(req, res) {

	var name = req.body.author.split(" ");
	var first = name[0];
	var last = name[1];
	var email = req.body.email;
	var title = req.body.title;
	var category = req.body.category;
	var article = req.body.article;
	var date = new Date();
	var current_time = date.toUTCString();

	//getting all authors
	db.all("SELECT * FROM authors;", function(err, rows) {
		if (err) {
			console.log(err);
		}
		else {
			var authors = rows;

			//go through each author to check if it is here
			var here = false;
			authors.forEach(function(element) {
				//if authors last name and email (uniqe attributes) exists
				if (element.last_name === last && element.author_email === email) {
					here = true;
					//insert the article into the article table
					db.run("INSERT INTO articles (title, article, category, author_id, date_made, date_edit) VALUES (?, ?, ?, ?, ?, ?);", title, article, category, element.id, current_time, '', function(err) {
						if (err) {
						console.log(err);
						};
					});					
				}

			});

			//otherwise
			if (here === false) {
				//create the author
				db.run("INSERT INTO authors (first_name, last_name, author_email) VALUES (?, ?, ?);", first, last, email, function(err) {
						if (err) {
							console.log(err);
						};
				});
				//grab the id from the new author
				db.get("SELECT author_id FROM authors WHERE first_name='"+first+"'", function(err, row) {
					if (err) {
						console.log(err);
					}
					else {
						var author_id = row.author_id;
						//insert into article with new id
						db.run("INSERT INTO articles (title, article, category, author_id, date_made, date_edit) VALUES (?, ?, ?, ?, ?, ?);", title, article, category, author_id, current_time, '', function(err) {
							if (err) {
								console.log(err);
							};
						});
					}
				})				
			}


		}
	})
	res.redirect("/wiki");
});




