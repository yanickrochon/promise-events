
'use strict';

describe("Test resultFilter", function () {

  const Emitter = require('../emitter');
  let _resultFilter;

  beforeAll(function () {
    _resultFilter = Emitter.defaultResultFilter;
  });

  afterAll(function () {
    Emitter.defaultResultFilter = _resultFilter;
  });


  it('should throw when adding invalid filters', function () {
    let events = new Emitter();

    [
      true, 'foo', /./, 42, {}, [], -1
    ].forEach(n => expect(() => events.resultFilter = n).toThrow('Filter must be a function') );
  });


  it('should reciprocate', function () {
    const events = new Emitter();

    expect( events.getResultFilter() ).toBe(undefined);

    const exampleFilter = function() { return true; };
    Emitter.defaultResultFilter = exampleFilter;
    expect( Emitter.defaultResultFilter ).toBe(exampleFilter);

    events.resultFilter = undefined;
    expect( events.resultFilter ).toBe(Emitter.defaultResultFilter);

    Emitter.defaultMaxListeners = 0;
    expect( Emitter.defaultMaxListeners ).toBe(0);
    expect( events.maxListeners ).toBe(0);
  });


  describe('Filtering the listener return values', function () {

    it('should not filter out undefined results by default', function () {
      const events = new Emitter();

      return Promise.all([
        events.on('foo', () => { return undefined; }),
        events.on('foo', () => { return 1; }),
        events.on('foo', () => { return 2; }),
      ]).then(function() {
        return events.emit('foo').then((results) => {
          expect( results ).toEqual( expect.arrayContaining([undefined, 1, 2]) );
        });
      });
    });

    it('should accept custom result filters', function() {
      const events = new Emitter();

      function filter(value) {
        return value !== 2;
      }

      events.setResultFilter(filter);
      expect( events ).toHaveProperty('_resultFilter', filter);

      return Promise.all([
        events.on('foo', () => { return undefined; }),
        events.on('foo', () => { return 1; }),
        events.on('foo', () => { return 2; }),
      ]).then(function() {
        return events.emit('foo').then((results) => {
          expect( results ).toEqual( expect.arrayContaining([undefined, 1]) );
        });
      });
    });

    it("should accept a custom 'undefined' filter", function() {
      const events = new Emitter();

      events.setResultFilter(undefined);

      return Promise.all([
        events.on('foo', () => { return undefined; }),
        events.on('foo', () => { return 1; }),
        events.on('foo', () => { return 2; }),
      ]).then(function() {
        return events.emit('foo').then((results) => {
          expect( results ).toEqual( expect.arrayContaining([undefined, 1, 2]) );
        });
      });
    });

    it('should throw when adding invalid filters', function() {
      const events = new Emitter();

      try {
        events.setResultFilter(42);
      } catch (err) {
        expect( err ).toBeInstanceOf(Error);
        expect( err ).toHaveProperty('message', 'Filter must be a function');
      }
    });
  });
});
