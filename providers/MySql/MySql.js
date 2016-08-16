/**
 * class deps
 * @access private
 */
var 
	_config = require( '../../config/config.js' ),
	_mysql = require( 'mysql' )
;


// connection pool details
var pool = _mysql.createPool({
//    connectionLimit : 100,
    host : _config.HOST,
    socketPath : _config.SOCKET_PATH,
    user : _config.USER,
    password : _config.PASSWORD,
    database : _config.DATABASE,
    debug : _config.DEBUG
});

// log
console.log( 'startMySqlService()'.green + ' - host ' + _config.HOST );

/**
 * class
 * @access public
 */
function MySql() {
	
	this.query = function( sql, cb ) {
		
	    // create connection
	    pool.getConnection(function( err, connection ) {
	    	
	        if ( err ) {
	        	console.error( 'SERVERERR - PROVIDER CONNECTION : ', err );
	        	cb( null );
	        	return;
	        }   

	        // log
	        console.log( 'MySql.query()'.magenta + ' - connected as id : ' + connection.threadId );
	        
	        // excercute sql
	        connection.query( sql ,function( err, resultSet ) {
	        	
	            connection.release();
	            
	            if ( err ) {
		        	console.error( 'SERVERERR - PROVIDER QUERY : ', err );
		        	console.log( 'MySql.query()'.magenta + ' - resultSet : NULL' );
		        	cb( null );
		        	return;
	            }    
	            
		        // log
		        console.log( 'MySql.query()'.magenta + ' - resultSet : ' );
		        console.log( resultSet );
		        
	            // data
	            cb( resultSet );
	            
	        });
	        
	        // error handling
	        /*
	        connection.on('error', function( err ) {      
	        	connection.release();
	        	console.error( 'SERVERERR - PROVIDER ERROR : ', err );
	          	return;
	        });
	        */

	    });
		
	}
    
    
};


// public
module.exports = MySql;