/**
 * class
 * @access public
 */
function Config() {
	
	// server
	this.PORT = 8080;
	this.URL = 'localhost';
	
	// database connection details
	this.HOST = '10.0.0.5';
	this.DB_PORT = '3306';
	this.SOCKET_PATH = '/Applications/MAMP/tmp/mysql/mysql.sock'; // MAMP - comment out for windows
	this.USER = 'mysql_username';
	this.PASSWORD = 'mysql_password';
	this.DATABASE = 'node_rest';
	this.DEBUG = false;
	    
};


// public
module.exports = new Config();