DROP TABLE IF EXISTS garages;
DROP TABLE IF EXISTS cars;

CREATE TABLE authors (
	author_id INTEGER PRIMARY KEY AUTOINCREMENT,
	first_name VARCHAR,
	last_name VARCHAR,
	author_email VARCHAR
);


CREATE TABLE articles (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT,
	article TEXT,
	category VARCHAR,
	author_id INTEGER,
	date_made VARCHAR,
	date_edit VARCHAR,
	FOREIGN KEY (author_id) REFERENCES authors (author_id)
);