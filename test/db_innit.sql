/* 
OUR DATABASE
*/
/*DROP DATABASE node_rest;*/

CREATE DATABASE node_rest;

USE node_rest;

/*
TEST TABLE CAR
*/
CREATE TABLE car (

	car_id INT NOT NULL AUTO_INCREMENT,
	PRIMARY KEY( car_id ),
	
	car_make VARCHAR(50) NOT NULL,
	car_model VARCHAR(50) NOT NULL,
	car_body VARCHAR(50) NOT NULL
	
);

DESCRIBE car;

/*
TEST DATA for TABLE CAR
*/
INSERT INTO car ( car_make, car_model, car_body ) VALUES ( 'ford', 'ranger', 'xl' );
INSERT INTO car ( car_make, car_model, car_body ) VALUES ( 'ford', 'focus', 'zetec' );
INSERT INTO car ( car_make, car_model, car_body ) VALUES ( 'ford', 'escort', 'rs' );
INSERT INTO car ( car_make, car_model, car_body ) VALUES ( 'bmw', 'm3', 'sedan' );
INSERT INTO car ( car_make, car_model, car_body ) VALUES ( 'bmw', 'm3', 'coupe' );

SELECT * FROM car;