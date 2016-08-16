/**
 * class deps
 * @access private
 */
//var 
//	_providers = require( '../providers/index.js' )
//;


/**
 * class
 * @access public
 */
function AbstractService() {
	
	
	/** 
	* NOTE: must implement:
	*
    * this.model - which model to use
    * 
    * this.table - db table
    * 
    * this.tablePrimaryKey - db table primary key
	*/
	
	
	// private local variables
	// init at index to avoid multi pooling
	var _providersMySql = global.window.providersMySql;
	
	
	/**
	 * paranoid validation, not necessary, helps me sleep better.
	 * @param {string} string
	 * @return {string} string
	 * @acces private
	 */
	function _removeFoulChars( string ) {
		
		if ( typeof string === 'string' ) {
		
			// foul
			// string = string.replace( /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '' );
			// string = string.replace( new RegExp( '\\', 'g' ), '/' );
			string = string.replace( /[\{\}\[\]\\\/]/gi, '/' );
			
			string = string.replace( new RegExp( '\'', 'g' ), '"' );
			string = string.replace( new RegExp( ';', 'g' ), '' );
			string = string.replace( new RegExp( 'delete', 'g' ), '' );
			string = string.replace( new RegExp( 'DELETE', 'g' ), '' );
			
		}
		
		return string;
		
	}
	
	
	/**
	 * gets rid of crap http replaces strings with
	 * @param {string} string
	 * @return {string} string
	 * @acces private
	 */
	function _removeHttpChars( string ) {
		
		if ( typeof string === 'string' ) {

			string = string.replace( new RegExp( '%20', 'g' ), ' ' );
			
		}
		
		return string;
		
	}
	
	
	/**
	 * change raw data into model objects
	 * @param {arr} data - result set
	 * @return {arr} modelData - model objects
	 * @access private
	 */
    function _createModelObjects( data, ctx, isSingleObj ) {
    	
    	// get model
    	var Model = require( '../models/' + ctx + '/' + ctx + '.js' );
    	
    	// format
    	if ( isSingleObj ) {
    		
    		var modelData = new Model( data[0] );
    		
    	} else {
    		
    		var modelData = [];
    		
        	for ( var dataKey in data ) {
        		
        		modelData.push( new Model( data[dataKey] ) );
        		
        	}
    		
    	}
    	
    	// data
        return modelData;
        
    };
	
	
	/**
	 * if string use '' if int not
	 * @param {string} string
	 * @return {string} string
	 * @access private
	 */
    function _useParentheses( string ) {

    	// currency
    	var ScRe = /[\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/;

    	if ( ScRe.test( string ) ) {
    		return "'" + string + "'" ;
    	}
    	
    	// serial numbers are funky
    	// 373737-ahaha
    	if ( parseInt( string ) && string.toString().match(/[a-z]/i) ) {
    		return "'" + string + "'" ;
    	}
    	
    	// format
        return val =  ( parseInt( string ) || string === true || string === false || string === 'true' || string === 'false' || string === 'NOW()' )? string : "'" + string + "'" ;
        
    };
    
	
	/**
	 * get data from db with or without primary key
	 * @param {int} ctx - primary key
	 * @return {obj} data || {arr} datas
	 * @access public
	 */
    this.get = function( ctx, cb ) {
    	
    	// localize
    	var table = this.table;
    	var tablePrimaryKey = this.tablePrimaryKey;
    	var model = this.model;

    	// build sql
    	var sqlBuilder = 'SELECT * FROM ' + table;
    	
    	if ( ctx )
    		sqlBuilder += ' WHERE ' + tablePrimaryKey + ' = ' + ctx;
    	
    	// log
    	console.log( 'AbstractService.get()'.blue + ' - sqlBuilder: ' + sqlBuilder );
    	
    	// invoke on provider
		_providersMySql.query( sqlBuilder, function( data ) {
			
			// return model objects
			var data = _createModelObjects( data, model, ctx );
			
			cb( data );
			
		});
        
    };
    
    
	/**
	 * get data from db based off params
	 * @param {arr} params - key value list
	 * @return {obj} data || {arr} datas
	 * @access public
	 */
    this.getByParams = function( params, cb ) {
    	
    	// localize
    	var table = this.table;
    	var tablePrimaryKey = this.tablePrimaryKey;
    	var model = this.model;
    	
    	// build sql
    	var sqlBuilder = 'SELECT * FROM ' + table + ' WHERE ';
    	
    	for ( var paramsKey in params ) {
    		
			// normal - excludes like's and or's
			sqlBuilder += _removeFoulChars( paramsKey ) + ' = ' + _useParentheses( _removeFoulChars( _removeHttpChars( params[paramsKey] ) ) ) + ' AND ';
    		
    	}
    	// remove naughty ' and '
		sqlBuilder = sqlBuilder.slice( 0, -5 );
    	
    	// log
    	console.log( 'AbstractService.getByParams()'.blue + ' - sqlBuilder: ' + sqlBuilder );
    	
    	// invoke on provider
		_providersMySql.query( sqlBuilder, function( data ) {
			
			// return model objects
			var data = _createModelObjects( data, model, false );
			
			cb( data );
			
		});
        
    };
    
    
	/**
	 * update a tables data
	 * @param {arr} params - key value list
	 * @return {obj} data || {arr} datas
	 * @access public
	 */
    this.update = function( params, cb ) {
    	
    	// localize
    	var table = this.table;
    	var tablePrimaryKey = this.tablePrimaryKey;
    	var model = this.model;
    	var key = '';

    	// build sql
    	var criteria = '';
    	var where = '';

    	var sqlBuilder = 'UPDATE ' + table + ' SET ';
    	
    	// make a string of propertys and another of their new values
    	// cater for the primary key
    	for ( var paramsKey in params ) {
    		
    		if ( paramsKey !== tablePrimaryKey ) {
    			criteria += paramsKey + ' = ' + _useParentheses( _removeFoulChars( _removeHttpChars( params[paramsKey] ) ) ) + ', ';
    		} else {
    			where += paramsKey + ' = ' + _useParentheses( _removeFoulChars( _removeHttpChars( params[paramsKey] ) ) ) + ' AND ';
    			key = params[paramsKey];
    		}
    		
    	}
    	
    	sqlBuilder += criteria.slice( 0, -2 );
    	sqlBuilder +=  ' WHERE ';
    	sqlBuilder += where.slice( 0, -5 );
    	
    	// log
    	console.log( 'AbstractService.update()'.blue + ' - sqlBuilder: ' + sqlBuilder );
    	
    	// invoke on provider
		_providersMySql.query( sqlBuilder, function( data ) {
			
			// return to controller
			cb( data );
			
		});
        
    };
    
    
	/**
	 * inserts a tables data
	 * @param {arr} params - key value list
	 * @return {obj} data || {arr} datas
	 * @access public
	 */
    this.insert = function( params, cb ) {
    	
    	// localize
    	var table = this.table;
    	var model = this.model;

    	// build sql
    	var keys = '';
    	var vals = '';

    	var sqlBuilder = 'INSERT INTO ' + table + ' ( ';
    	
    	// make a string of propertys and another of their new values
    	for ( var paramsKey in params ) {
    		
    		keys += _removeFoulChars( paramsKey ) + ', ';
    		
    		vals += _useParentheses( _removeFoulChars( _removeHttpChars( params[paramsKey] ) ) ) + ', ';
    		
    	}

    	sqlBuilder += keys.slice( 0, -2 );
    	sqlBuilder += ' ) VALUES (';
    	sqlBuilder += vals.slice( 0, -2 );
    	sqlBuilder += ' )';
    	
    	// log
    	console.log( 'AbstractService.insert()'.blue + ' - sqlBuilder: ' + sqlBuilder );
    	
    	// invoke on provider
		_providersMySql.query( sqlBuilder, function( data ) {
			
			// return to controller
			cb( data );
			
		});
        
    };
    
    
};

// public
module.exports = AbstractService;