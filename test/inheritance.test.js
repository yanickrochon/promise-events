
'use strict';

describe("Test inheritance", function () {

  const Emitter = require('../emitter');


  it("should create valid instance", function () {
    const util = require('util');
    const SubEmitter = function () {};

    let events;

    util.inherits(SubEmitter, Emitter);

    events = new SubEmitter();

    expect( events ).toBeInstanceOf( Emitter );

    // broken tests since Node v10
    //expect( events ).not.toHaveProperty('_events');
    //expect( events ).not.toHaveProperty('_eventsCount');

    return events.on('foo', () => {}).then(() => {

      expect( events ).toHaveProperty('_events')
      expect( events._events ).toHaveProperty('foo');
      expect( events ).toHaveProperty('_eventsCount', 1);

    });

  });


  it('should be instance of built-in EventEmitter', function () {
    const EventEmitter = require('events').EventEmitter;

    let events = new Emitter();

    expect( events ).toBeInstanceOf( EventEmitter );
  });

});
