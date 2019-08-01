'use strict';

describe("Test maxListeners", function () {

  const Emitter = require('../emitter');
  let _maxListeners;

  beforeAll(function () {
    _maxListeners = Emitter.defaultMaxListeners;
  });

  afterAll(function () {
    Emitter.defaultMaxListeners = _maxListeners;
  });


  it('should not set invalid value', function () {
    let events = new Emitter();

    [
      undefined, null, false, true, '', 'foo', /./, function () {}, {}, [], -1, NaN
    ].forEach(n => expect(() => events.maxListeners = n).toThrow() );
  });


  it('should reciprocate', function () {
    let events = new Emitter();

    expect( events.getMaxListeners() ).toBe(events.maxListeners);

    Emitter.defaultMaxListeners = 10;
    expect( Emitter.defaultMaxListeners ).toBe(10);

    expect( events.maxListeners ).toBe(Emitter.defaultMaxListeners);

    Emitter.defaultMaxListeners = 0;
    expect( Emitter.defaultMaxListeners ).toBe(0);
    expect( events.getMaxListeners() ).toBe(0);
    expect( events.maxListeners ).toBe(0);

    for (let i = 1; i < 100; ++i) {
      expect( events.setMaxListeners(i).getMaxListeners() ).toBe(events.maxListeners);
      expect( events.maxListeners ).toBe(i);
    }
  });


  it("should detect memory leak", function () {
    const events = new Emitter();
    const _error = console.error;
    const _trace = console.trace;
    let errorCount = 0;
    let traceCount = 0;

    console.error = function () {
      ++errorCount;
    };
    console.trace = function () {
      ++traceCount;
    };

    events.maxListeners = 5;

    for (var i = 0; i < events.maxListeners + 2; ++i) {
      expect( events.listeners('test') ).toHaveLength(i);
      events.on('test', () => {});
    }

    expect( events.listeners('test') ).toHaveLength(events.maxListeners + 2);

    expect( errorCount ).toEqual(1);
    expect( traceCount ).toEqual(1);

    events.removeAllListeners();
    expect( events.listeners('test') ).toHaveLength(0);

    console.error = _error;
    console.trace = _trace;
  });


});
