/**
 * App Deps
 */
var 
	_colors = require( 'colors' ), // pretty logging
	_controllers = require( './controllers/index.js' ),
	_config = require( './config/Config.js' ),
	_cluster = require( 'cluster' ),
	_domain = require( 'domain' ),
	_numCPUs = require( 'os' ).cpus().length,
	_express = require( 'express' ),
	_bodyParser = require( 'body-parser' ),
	_fs = require( 'fs' ),
	// _https = require( 'https' ), not used in this example
	_logger = require( 'morgan' )
;


/**
 * Server
 */
if ( _cluster.isMaster ) {
	
	for ( var i = 0; i < _numCPUs; i++ ) {
		
		_cluster.fork();
		
	}
	
	_cluster.on( 'exit', function( deadWorker, code, signal ) {
		
		// console.error( 'SERVERERR - _cluster worker ' + worker.process.pid + ' died', code );
		
	    // Restart the worker
	    var worker = _cluster.fork();

	    // Note the process IDs
	    var newPID = worker.process.pid;
	    var oldPID = deadWorker.process.pid;

	    // Log the event
	    console.log( 'worker ' + oldPID + ' died.' );
	    console.log( 'worker ' + newPID + ' born.' );
		
	});

} else {
	
	// the logger
	var logfileApache = _fs.createWriteStream( './logs/logfile-apache.log', { flags: 'a' } );
	
	// the worker
	var app = _express();
	
		app.use( _bodyParser.json({ limit: '50mb' }) );       // to support JSON-encoded bodies
		
		app.use( _bodyParser.urlencoded({     // to support URL-encoded bodies
			extended: true,
			limit: '50mb'
		}) ); 

		// apache server style logs to file
		app.use( _logger( 'common', {
			stream: logfileApache 
		} ) );

	// NON SSL	
	var server = app.listen( _config.PORT );
		
	// SSL
//	var options = {
//	    key: _fs.readFileSync( './ssl/server.key' ),
//	    cert: _fs.readFileSync( './ssl/server.crt' ),
//	    ca: _fs.readFileSync( './ssl/intermediate.crt' )
//	};
//
//	var server = _https.createServer( options, app ).listen( _config.PORT, function() {
//	  console.log( 'https.createServer()'.green + ' - Express server listening on port' + _config.PORT );
//	});
	
	// rest service
	app.all( '/api/*', function ( req, res ) {
		
		startDomainService( req, res );
	    
	});
	
	// public file access
	// used for TEST
	app.use( _express.static( __dirname + '/test' ) );
  
}


/**
 * Init domain service
 * @param req - http request
 * @param res - http response
 */
function startDomainService( req, res ) {

	var d = _domain.create();
	d.on( 'error', function( er ) {
		
		// log
		console.error( 'SERVERERR - ', er.stack );
		
		try {
			  
			// make sure we close down within 30 seconds
			var killtimer = setTimeout(function() {
				
				process.exit(1);
			  
			}, 300 ); // 300 // 3000 // 30000
			
			// But don't keep the process open just for that!
			killtimer.unref();
			
			// stop taking new requests.
			server.close();
			
			// Let the master know we're dead.  This will trigger a
			// 'disconnect' in the _cluster master, and then it will fork a new worker.
			_cluster.worker.disconnect();
			
			// log
			doHttpReqErr( req, res, 'startDomainService() - Domain error', '500' );
		    
		} catch ( er2 ) {

			// log
			console.error( 'SERVERERR - ', er2.stack );
			doHttpReqErr( req, res, 'startDomainService() - Domain init', '500' );
		    
		}
	  
	});
	
	// Because req and res were created before this _domain existed,
	// we need to explicitly add them.
	// See the explanation of implicit vs explicit binding below.
	d.add( req );
	d.add( res );
	
	// Now run the handler function in the _domain.
	d.run(function() {
		
		// log
		console.log( 'startDomainService()'.green + ' - listen: ' + server.address().address + ':' + server.address().port );
		console.log( 'startDomainService()'.green + ' - Worker: ' + _cluster.worker.id + ' id running' );
		
		// fire up globals
		GLOBAL.window = {};
		
		// fire up providers
		var _providers = require( './providers/index.js' );
		
		GLOBAL.window.providersMySql = new _providers.MySql();
		
		// start the ball rolling
		handleApiRequest( req, res );
	  
	});
	
}


/**
 * Request Routing
 * @param req - http request
 * @param res - http response
 */
function handleApiRequest( req, res ) {
	
	// log
	console.log( 'handleApiRequest()'.green + ' - req.method: ' + req.method );
	
	// allow cross domain for mobile app acess etc
	res.header('Access-Control-Allow-Origin', req.headers.origin); // "*"
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.header('Access-Control-Allow-Credentials', 'true');
	
	// routing
	switch ( req.method ) {
	
	    case 'GET':
	        doGet( req, res );
	        break;
	        
	    case 'POST':
	        doPost( req, res );
	        break;
	        
	    default: 
	        doHttpReqErr( req, res, 'handleApiRequest() - 505 Invalid HTTP type', '505' );
    
	}
  
}


/**
 * Handle GET request
 * @param req - http request
 * @param res - http response
 */
function doPost( req, res ) {
	
	// locals
	var controllerName = null;
	var controller = null;
	var reqData = null;
	
	/*
	 * Sort incoming get headders
	 */
	(function sortParams () {
	
		// ctx data 
		reqData = req.body;
		
		var urlPiecesArr = req.url.split( '/' );
		var reqType = urlPiecesArr[2];
		
		// not after data
		if ( ( !reqType ) || ( !reqData ) ) {
			doHttpReqErr( req, res, 'doPost() - Invalid HTTP req params', '403' );
			return;
		}
		
		// log
		console.log( 'doPost()'.green + ' - reqType : ' + reqType );
		console.log( 'doPost()'.green + ' - reqPostData : ' + reqData );
	
		initController( reqType );
		
	})();
	
	
	/*
	 * Instantiate controller
	 */
	function initController( reqType ) {
	
		// hand over to controller
		controllerName = reqType;
		
		if ( !_controllers[ controllerName ] ) {
			doHttpReqErr( req, res, 'doPost() - Controller not found', '403' );
			return;
		}
		
		controller = new _controllers[ controllerName ];
		
		if ( !controller.isApi ) {
			doHttpReqErr( req, res, 'doPost() - Controller not public', '403' );
			return;
		}
		
		runController();
	
	}
	
	
	/*
	 * 200 OK
	 */ 
	function runController() {
	
		controller.doPost( { reqData: reqData, session : req.session }, function( err, data ) {
			
			if ( err ) {
				doHttpReqErr( req, res, err, '403' );
				return;
			}
			
			// return data
			finishDoPost( data );
			
		});
		
	}

	
	/*
	* return data
	*/
	function finishDoPost( data ) {
		
		res.writeHead( 200, { 'Content-Type' : 'application/json' } );
		res.end( JSON.stringify( data ) );
		console.log( 'doGet() - 200 OK'.yellow );
	
	}
	
}


/**
 * Handle GET request
 * @param req - http request
 * @param res - http response
 */
function doGet( req, res ) {
	
	// locals
	var controllerName = null;
	var controller = null;
	var reqParams = null;
	var reqTypeId = null;
	
	/*
	 * Sort incoming get headders
	 */
	(function sortParams () {
		
		// get params
		var urlParamsPiecesArr = req.url.split( '?' );
		
		// format get params
		if ( urlParamsPiecesArr[1] ) {
			
			reqParams = {};
			
			var reqParamsArr = urlParamsPiecesArr[1].split( '&' );
			
			for ( var reqParamsArrKey in reqParamsArr ) {
				var reqParamsPiecesArr = reqParamsArr[ reqParamsArrKey ].split( '=' );
				
				if ( ( reqParamsPiecesArr[0] !== 'callback' ) && ( reqParamsPiecesArr[0] !== '_' ) )
					reqParams[ reqParamsPiecesArr[0] ] = reqParamsPiecesArr[1];
				
			}
			
		} else {
			
			reqParams = undefined;
			
		}
		
		initController ( ( urlParamsPiecesArr[1] )? urlParamsPiecesArr[0] : req.url );
	
	})();
	
	
	/*
	 * Instantiate controller
	 */
	function initController( reqUrl ) {
		
		// request from url
		var urlPiecesArr = reqUrl.split( '/' );
		
		var reqType = urlPiecesArr[2];
		reqTypeId = urlPiecesArr[3];
		
		// not after data
		if ( ( !reqType ) && ( !reqTypeId ) ) {
			doHttpReqErr( req, res, 'doGet() - Invalid HTTP req params', '403' );
			return;
		}
		
		// log
		console.log( 'doGet()'.green + ' - reqType : ' + reqType );
		console.log( 'doGet()'.green + ' - reqTypeId : ' + reqTypeId );
		
		// hand over to controller
		controllerName = reqType;
		
		if ( !_controllers[ controllerName ] ) {
			doHttpReqErr( req, res, 'doGet() - Controller not found', '403' );
			return;
		}
		
		controller = new _controllers[ controllerName ];
		
		if ( !controller.isApi ) {
			doHttpReqErr( req, res, 'doGet() - Controller not public', '403' );
			return;
		}
		
		runController();
		
	}

	
	/*
	 * 200 OK
	 */ 
	function runController() {
		
		controller.doGet( { reqParams: reqParams, reqTypeId : reqTypeId, session : req.session }, function( err, data ) {
			
			if ( err ) {
				doHttpReqErr( req, res, err, '403' );
				return;
			}
			
			// finish
			finishDoGet( data );
			
		});
		
	}

	
	/*
	* return data
	*/
	function finishDoGet( data ) {
		
		res.writeHead( 200, { 'Content-Type' : 'application/json' } );
		res.end( JSON.stringify( data ) );
		console.log( 'doGet() - 200 OK'.yellow );
	
	}
	
}


/**
 * Incoming HTTP method not lekke
 * @param req - http request
 * @param res - http response
 */
function doHttpReqErr( req, res, err, code ) {
	
	// 500 Internal Server Error
	var err = err || 'doHttpReqErr() - 500 Internal Server Error';
	
	console.log( err.yellow );
	res.writeHead( code || 500, { 'Content-Type' : 'text/plain' } );
	
	res.end( err );
	
}
