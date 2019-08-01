
'use strict';

describe("Test EventEmitter prototype", function () {

  const Emitter = require('../emitter');

  it("should provide standard emitter interface", function () {
    let events = new Emitter();

    expect( typeof Emitter.prototype.getMaxListeners ).toEqual( 'function' );
    expect( typeof Emitter.prototype.setMaxListeners ).toEqual( 'function' );
    expect( typeof Emitter.prototype.emit ).toEqual( 'function' );
    expect( typeof Emitter.prototype.addListener ).toEqual( 'function' );
    expect( typeof Emitter.prototype.on ).toEqual( 'function' );
    expect( typeof Emitter.prototype.once ).toEqual( 'function' );
    expect( typeof Emitter.prototype.removeListener ).toEqual( 'function' );
    expect( typeof Emitter.prototype.removeAllListeners ).toEqual( 'function' );
    expect( typeof Emitter.prototype.listeners ).toEqual( 'function' );

    expect( typeof events.getMaxListeners ).toEqual( 'function' );
    expect( typeof events.setMaxListeners ).toEqual( 'function' );
    expect( typeof events.emit ).toEqual( 'function' );
    expect( typeof events.addListener ).toEqual( 'function' );
    expect( typeof events.on ).toEqual( 'function' );
    expect( typeof events.once ).toEqual( 'function' );
    expect( typeof events.removeListener ).toEqual( 'function' );
    expect( typeof events.removeAllListeners ).toEqual( 'function' );
    expect( typeof events.listeners ).toEqual( 'function' );

    expect( events ).toHaveProperty('_events');
    expect( events ).toHaveProperty('_maxListeners');
  });


  it('should provide method and property aliases', function () {
    let descriptor;

    expect( Emitter.prototype.on ).toBe( Emitter.prototype.addListener );
    expect( Emitter.prototype ).toHaveProperty('maxListeners');

    descriptor = Object.getOwnPropertyDescriptor(Emitter.prototype, 'maxListeners');
    expect( typeof descriptor.get ).toEqual( 'function' )
    expect( typeof descriptor.set ).toEqual( 'function' )
  });


});
