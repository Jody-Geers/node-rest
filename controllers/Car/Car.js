/**
 * class deps
 * @access private
 */
var _controllers = require( '../index.js' ),
	_services = require( '../../services/index.js' )
;


/**
 * class
 * @access public
 */
function Car() {
	
	
	// data service
	var _servicesCar = new _services.Car();
	
	// publically visible
	this.isApi = true;
    
	
    /**
     * gets data
     * @param {obj} args.reqParams - http request params
     * @param {int} args.reqTypeId - Car id
     * @param {funct} args.cb
     * @return {obj} data || {arr} datas
     * @access public
     */
    this.doGet = function( args, cb ) {
    	
    	var reqParams = args.reqParams;
    	var reqTypeId = args.reqTypeId;
    	var cb = cb;
    	
    	// log
    	console.log( 'Car.doGet()'.cyan + ' - reqParams : ' + JSON.stringify( reqParams ) );
    	console.log( 'Car.doGet()'.cyan + ' - reqTypeId : ' + reqTypeId );
    	
    	// get data
    	if ( reqParams ) {
    		
    		// multiple propertys
    		_servicesCar.getByParams( reqParams, function( carData ) {

    			cb( null, carData );
    			
    		});
    		
    	} else {
    		
    		// by single id else all
    		_servicesCar.get( ( parseInt( reqTypeId ) )? reqTypeId : undefined, function( carData ) {
    			
    			cb( null, carData );
    			
    		});
    		
    	}
        
    };
    
    
    
    /**
     * sets data
     * @param {obj} args.reqData - http request params
     * @param {funct} args.cb
     * @return {obj} data || {arr} datas
     * @access public
     */
    this.doPost = function( args, cb ) {
    	
    	var reqData = args.reqData;
    	var cb = cb;
    	
    	// log
    	console.log( 'Car.doPost()'.cyan + ' - reqData : ' + JSON.stringify( reqData ) );
    	
    	// validation
    	if ( !reqData ) {
			// 500 Internal Server Error
    		cb( 'Car.doPost() - Validation failed', null );
    		return;
    	}
    	
    	// update
    	if ( reqData[ _servicesCar.tablePrimaryKey ] ) {
    		
    		_servicesCar.update( reqData, function( carData ) {
    			
    			cb( null, carData );
    			
    		});
    		
		// insert
    	} else {
    		
    		_servicesCar.insert( reqData, function( insertMetaData ) {
    			
    			// return inserted data
        		_servicesCar.get( insertMetaData.insertId, function( carData ) {
        			
        			cb( null, carData );
        			
        		});
    			
    		});
    		
    	}
        
    };
    
    
};


// public
module.exports = Car;