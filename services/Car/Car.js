/**
 * class deps
 * @access private
 */
var 
	_AbstractService = require( '../AbstractService.js' )
;


/**
 * class
 * @access public
 */
function ScAuthorization() {
    
	
	// implementation
	_AbstractService.apply( this );
	
	// which model to use
    this.model = 'Car';
    
    // table
    this.table = 'car';
    
    // table primary
    this.tablePrimaryKey = 'car_id';
    
    
};


// public
module.exports = ScAuthorization;