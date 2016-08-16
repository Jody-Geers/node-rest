/**
 * class
 * @access public
 */
function Car( args ) {

    this.car_id = ( args )? args.car_id : undefined;
    this.car_make = ( args )? args.car_make : undefined;
    this.car_model = ( args )? args.car_model : undefined;
    this.car_body = ( args )? args.car_body : undefined;

};


// public
module.exports = Car;