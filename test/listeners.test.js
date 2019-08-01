'use strict';

describe("Test adding and removing listeners", function () {
  const Emitter = require('../emitter');


  it("should add and remove listeners", function () {
    const events = new Emitter();
    let fn = function () {};

    expect( events ).toHaveProperty('_eventsCount', 0);

    return events.addListener('foo', fn).then(() => {
      expect( events ).toHaveProperty('_eventsCount', 1);
      expect( events._events ).toHaveProperty('foo', fn);

      return events.addListener('foo', fn);
    }).then(() => {
      expect( events ).toHaveProperty('_eventsCount', 2);
      expect( events._events ).toHaveProperty('foo', [fn, fn]);

      return events.removeListener('foo', () => {});  // unknown listener
    }).then(() => {
      expect( events ).toHaveProperty('_eventsCount', 2);
      expect( events._events ).toHaveProperty('foo', [fn, fn]);

      return events.removeListener('foo', fn);
    }).then(() => {
      expect( events ).toHaveProperty('_eventsCount', 1);
      expect( events._events ).toHaveProperty('foo', fn);

      return events.removeListener('foo', fn);
    }).then(() => {
      expect( events ).toHaveProperty('_eventsCount', 0);
      expect( events._events ).toEqual({});

      return events.removeListener('buz', fn);
    });
  });


  it("should not add invalid listeners", function () {
    const events = new Emitter();

    return Promise.all([undefined, null, false, true, -1, 0, 1, '', {}, [], /./].map(function (invalid) {
      try {
        events.on('foo', invalid).then(() => {
          throw new Error("Should not allow adding invalid listener : " + invalid);
        });
      } catch (e) {
        expect( e ).toHaveProperty('message', '"listener" argument must be a function');
      }

      try {
        events.once('foo', invalid).then(() => {
          throw new Error("Should not allow adding invalid once listener : " + invalid);
        });
      } catch (e) {
        expect( e ).toHaveProperty('message', '"listener" argument must be a function');
      }

    }));
  });


  it('should not recursively call `once` events (from Node test case)', function () {
    const events = new Emitter();
    let times_recurse_emitted = 0;
    let emittedExtraEvent = false;

    events.on('e', function() {
      if (emittedExtraEvent) {
        return; // avoid infinite recursion, basically imitate .once()
      }

      emittedExtraEvent = true;
      return events.emit('e').then(() => {
        times_recurse_emitted++;
      });
    });

    events.once('e', function() {
      times_recurse_emitted++;
    });

    return events.emit('e').then(() => {
      expect( times_recurse_emitted ).toBe(2);
    });
  });


  it('should not recursively call `once` events', function () {
    const events = new Emitter();
    let removeCount = 0;
    let fooCount = 0;

    return Promise.all([
      events.once('removeListener', function () {
        ++removeCount;
        return events.emit('removeListener');  // try to call this event again
      }),
      events.once('foo', function () {
        ++fooCount;
        return events.emit('foo');  // try to call this event again
      })
    ]).then(() => {
      return events.emit('foo').then(() => {
        expect( removeCount ).toBe(1);
        expect( fooCount ).toBe(1);

        expect( events._events ).toEqual({});
      });
    });
  });


  it('should fire only `once` (async)', function () {
    const events = new Emitter();
    let times_hello_emited = 0;

    return events.once('hello', function(a, b) {
      times_hello_emited++;
    }).then(() => {
      return Promise.all([
        events.emit('hello', 'a', 'b'),
        events.emit('hello', 'a', 'b'),
        events.emit('hello', 'a', 'b'),
        events.emit('hello', 'a', 'b')
      ]).then(() => {
        expect( times_hello_emited ).toBe(1);
      });
    });
  });


  it('should fire only `once` (sync)', function () {
    const events = new Emitter();
    let times_hello_emited = 0;

    events.once('hello', function(a, b) {
      times_hello_emited++;
    });

    return Promise.all([
      events.emit('hello', 'a', 'b'),
      events.emit('hello', 'a', 'b'),
      events.emit('hello', 'a', 'b'),
      events.emit('hello', 'a', 'b')
    ]).then(() => {
      expect( times_hello_emited ).toBe(1);
    });
  });


  it('should not fire `once` if removed first (async)', function () {
    const events = new Emitter();
    const remove = function() {
      throw new Error('once->foo should not be emitted!');
    };

    return events.once('foo', remove).then(() => {
      return events.removeListener('foo', remove);
    }).then(() => {
      return events.emit('foo');
    });
  });


  it('should not fire `once` if removed first (sync)', function () {
    const events = new Emitter();
    const remove = function() {
      throw new Error('once->foo should not be emitted!');
    };

    events.once('foo', remove);
    events.removeListener('foo', remove);

    return events.emit('foo');
  });


  it("should not prepend invalid listeners", function () {
    const events = new Emitter();

    return Promise.all([undefined, null, false, true, -1, 0, 1, '', {}, [], /./].map(function (invalid) {
      try {
        events.prependListener('foo', invalid).then(() => {
          throw new Error("Should not allow prepending invalid listener : " + invalid);
        });
      } catch (e) {
        expect( e ).toHaveProperty('message', '"listener" argument must be a function');
      }

      try {
        events.prependOnceListener('foo', invalid).then(() => {
          throw new Error("Should not allow prepending invalid once listener : " + invalid);
        });
      } catch (e) {
        expect( e ).toHaveProperty('message', '"listener" argument must be a function');
      }

    }));
  });

  it('should prepend listeners', function () {
    const events = new Emitter();
    let buffer = '';

    return Promise.all([
      events.addListener('test', () => buffer = buffer + 'A'),
      events.prependListener('test', () => buffer = buffer + 'B'),
      events.once('test', () => buffer = buffer + '!'),
      events.prependOnceListener('test', () => buffer = buffer + 'C')
    ]).then(() => {
      buffer = '';
      return events.emit('test', () => {
        buffer.should.equal('CBA!');
      });
    }).then(() => {
      buffer = '';
      return events.emit('test', () => {
        buffer.should.equal('BA');
      });
    });
  });



  it("should not remove invalid listeners", function () {
    const events = new Emitter();

    return Promise.all([undefined, null, false, true, -1, 0, 1, '', {}, [], /./].map(function (invalid) {
      try {
        events.removeListener('foo', invalid).then(() => {
          throw new Error("Should not allow removing invalid listener : " + invalid);
        });
      } catch (e) {
        expect( e ).toHaveProperty('message', '"listener" argument must be a function');
      }
    }));
  });

  it("should remove all listeners", function () {
    const events = new Emitter();
    let fn = function () {};

    return Promise.all([
      events.on('foo', fn),
      events.on('foo', fn),
      events.on('foo', fn),
      events.on('bar', fn),
      events.on('bar', fn),
      events.on('meh', fn),
      events.on('meh', fn),
      events.on('removeListener', fn)
    ]).then(() => {

      expect( events._events['foo'] ).toHaveLength(3);
      expect( events._events['bar'] ).toEqual([fn, fn]);
      expect( events._events['meh'] ).toEqual([fn, fn]);

      return events.removeAllListeners('foo').then(() => {

        expect( events._events ).not.toHaveProperty('foo');
        expect( events._events['bar'] ).toEqual([fn, fn]);
        expect( events._events['meh'] ).toEqual([fn, fn]);
        expect( events._events['removeListener'] ).toEqual(fn);
        expect( events ).toHaveProperty('_eventsCount', 5);

        return events.removeAllListeners('missingEvent');
      }).then(() => {
        expect( events._events['bar'] ).toEqual([fn, fn]);
        expect( events._events['meh'] ).toEqual([fn, fn]);
        expect( events._events['removeListener'] ).toEqual(fn);
        expect( events ).toHaveProperty('_eventsCount', 5);

        return events.removeAllListeners();
      }).then(() => {
        expect( events._events ).toEqual({});
        expect( events ).toHaveProperty('_eventsCount', 0);

        return events.on('foo', fn);
      }).then(() => {

        expect( events._events ).toHaveProperty('foo', fn);
        expect( events ).toHaveProperty('_eventsCount', 1);

        return events.removeAllListeners('foo');
      }).then(() => {
        expect( events._events ).toEqual({});
        expect( events ).toHaveProperty('_eventsCount', 0);

        return events.on('foo', fn).then(events.on('bar', fn)).then(events.removeAllListeners('foo'));
      }).then(() => {
        expect( events._events ).not.toHaveProperty('foo');
        expect( events._events ).toHaveProperty('bar', fn);
        expect( events ).toHaveProperty('_eventsCount', 1);

        return events.removeAllListeners('buz');
      }).then(() => {
        expect( events._events ).toHaveProperty('bar', fn);
        expect( events ).toHaveProperty('_eventsCount', 1);

        // hard reset
        events._events = null;
        events._eventsCount = 0;

        return events.removeAllListeners();
      }).then(() => {
        expect( events._events ).toBe(null);
        expect( events ).toHaveProperty('_eventsCount', 0);
      });

    });
  });


  it("should handle emitted errors", function () {
    const events = new Emitter();

    return events.on('foo', function () {
      throw new Error('Test');
    }).then(() => {

      return Promise.all([
        events.emit('foo').then(() => {
          throw new Error('Failed test');
        }, function (err) {
          expect( err ).toHaveProperty('message', 'Test');
        }),
        events.emit('foo', 1).then(() => {
          throw new Error('Failed test');
        }, function (err) {
          expect( err ).toHaveProperty('message', 'Test');
        }),
        events.emit('foo', 1, 2).then(() => {
          throw new Error('Failed test');
        }, function (err) {
          expect( err ).toHaveProperty('message', 'Test');
        }),
        events.emit('foo', 1, 2, 3).then(() => {
          throw new Error('Failed test');
        }, function (err) {
          expect( err ).toHaveProperty('message', 'Test');
        }),
        events.emit('foo', 1, 2, 3, 4).then(() => {
          throw new Error('Failed test');
        }, function (err) {
          expect( err ).toHaveProperty('message', 'Test');
        })
      ]);

    });

  });


});
