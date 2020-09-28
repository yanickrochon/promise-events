
'use strict';

describe("Test inheritance", () => {

  const Emitter = require('../emitter');
  const NativeEmitter = require('events').EventEmitter;

  afterEach(() => {
    Emitter.errorMonitor = undefined;
  });


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
    let errorMonitored = null;
    let errorEmitted = null;

    Emitter.errorMonitor = err => errorMonitored = err;

    const events = new Emitter();
    const error = new Error('test');

    await events.addListener('error', err => errorEmitted = err)
    await events.emit('error', error).catch(err => console.log(err.stack));

    expect( errorMonitored ).toBe(error);
    expect( errorEmitted ).toBe(error);

  });

});
