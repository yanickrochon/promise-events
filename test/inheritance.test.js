
'use strict';

describe("Test inheritance", () => {

  const Emitter = require('../emitter');
  const NativeEmitter = require('events').EventEmitter;


  it("should create valid instance", () => {
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


  it('should be instance of built-in EventEmitter', () => {
    const events = new Emitter();

    expect( events ).toBeInstanceOf( NativeEmitter );
  });


  it('should return valid event names', async () => {
    const events = new Emitter();

    await events.addListener('test', () => {});

    expect( events.eventNames() ).toEqual(['test']);
  });


  it('should use error monitor', async () => {
    if (Emitter.errorMonitor) {
      const events = new Emitter();
      const error = new Error('test');

      let errorMonitored = null;
      let errorEmitted = null;

      await events.addListener(Emitter.errorMonitor, err => errorMonitored = err);
      await events.addListener('error', err => errorEmitted = err);

      await events.emit('error', error);

      expect( errorMonitored ).toBe(error);
      expect( errorEmitted ).toBe(error);
    }
  });

  it("Emitter should provide self reference", function () {
    expect(Emitter.EventEmitter).toBe(Emitter)
  });

});
