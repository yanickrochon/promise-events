
'use strict';

describe("Test emitting events", () => {

  const Emitter = require('../emitter');


  describe("Emitting events", () => {

    it("should emit 'newListener'", () => {
      let events = new Emitter();
      let fnFoo = function foo() {};
      let fnBar = function bar() {};
      let listeners = {};

      return events.addListener('newListener', (type, listener) => {
        listeners[type] = listener;
      }).then(() => {
        return events.addListener('foo', fnFoo).then(events.on('bar', fnBar)).then(() => {

          expect( listeners ).toHaveProperty('foo', fnFoo);
          expect( listeners ).toHaveProperty('bar', fnBar);

        });
      });
    });


    it("should emit 'removeListener'", () => {
      let events = new Emitter();
      let fn = () => {};
      let listeners = { 'foo': fn };

      return events.addListener('removeListener', (type, listener) => {
        expect( listener ).toEqual(listeners[type]);

        listeners[type] = false;
      }).then(() => {
        return events.on('foo', fn).then(() => {
          return events.removeListener('foo', fn).then(() => {

            expect( listeners ).toHaveProperty('foo', false);

          });
        });
      });
    });


    it("should emit with no arguments", () => {
      let events = new Emitter();
      let fn = function () {
        expect( arguments ).toHaveLength(0);
      };

      expect( events.listeners('foo') ).toHaveLength(0);

      return events.addListener('foo', fn).then(() => {
        return events.emit('foo').then((results) => {

          expect( results ).toHaveLength(1);
          expect( Emitter.listenerCount(events, 'foo') ).toEqual(1);

          return events.on('foo', fn).then(() => {
            expect( events.listeners('foo') ).toHaveLength(2);

            return events.emit('foo').then((results) => {

              expect( results ).toHaveLength(2);
              expect( Emitter.listenerCount(events, 'foo') ).toEqual(2);
    
            });
          });
        });
      });
    });


    it("should emit with one argument", () => {
      let events = new Emitter();
      let a = 'Hello';
      let fn = function (arg1) {
        expect( arguments ).toHaveLength(1);
        expect( arg1 ).toBe(a);

        return arg1;
      };

      return events.addListener('foo', fn).then(() => {
        return events.emit('foo', a).then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([a]) );

        }).then(events.on('foo', fn)).then(() => {
          return events.emit('foo', a).then((results) => {

            expect( results ).toHaveLength(2);
            expect( results ).toEqual( expect.arrayContaining([ a ]) );
            expect( results ).toEqual( expect.not.arrayContaining([ undefined ]) );
  
          });
        });
      });
    });


    it("should emit with two argument", () => {
      let events = new Emitter();
      let a = 'Hello';
      let b = 'World';
      let fn1 = function (arg1, arg2) {
        expect( arguments ).toHaveLength(2);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);

        return arg1;
      };
      let fn2 = function (arg1, arg2) {
        expect( arguments ).toHaveLength(2);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);

        return arg2;
      };

      return events.addListener('foo', fn1).then(() => {
        return events.emit('foo', a, b).then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([a]) );

        }).then(events.on('foo', fn2)).then(() => {
          return events.emit('foo', a, b).then((results) => {

            expect( results ).toHaveLength(2);
            expect( results ).toEqual( expect.arrayContaining([a, b]) );
  
          });
        });
      });
    });


    it("should emit with three argument", () => {
      let events = new Emitter();
      let a = 'Hello';
      let b = 'World';
      let c = '!!';
      let fn1 = function (arg1, arg2, arg3) {
        expect( arguments ).toHaveLength(3);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);
        expect( arg3 ).toBe(c);

        return arg1;
      };
      let fn2 = function (arg1, arg2, arg3) {
        expect( arguments ).toHaveLength(3);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);
        expect( arg3 ).toBe(c);

        return arg2;
      };
      let fn3 = function (arg1, arg2, arg3) {
        expect( arguments ).toHaveLength(3);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);
        expect( arg3 ).toBe(c);

        return arg3;
      };

      return events.addListener('foo', fn1).then(() => {
        return events.emit('foo', a, b, c).then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([ a ]) );

        }).then(events.addListener('foo', fn2)).then(() => {
          return events.emit('foo', a, b, c).then((results) => {

            expect( results ).toHaveLength(2);
            expect( results ).toEqual( expect.arrayContaining([ a, b ]) );

          }).then(events.on('foo', fn3)).then(() => {
            return events.emit('foo', a, b, c).then((results) => {

              expect( results ).toHaveLength(3);
              expect( results ).toEqual( expect.arrayContaining([ a, b, c ]) );

            });
          });
        });
      });
    });


    it("should emit with many argument", () => {
      let events = new Emitter();
      let args = ['a', 'b', 'c', 'd'];
      function fnGenerator(retVal) {
        return function () {
          expect( arguments ).toHaveLength(args.length);
          expect( Array.prototype.slice.call(arguments) ).toEqual( expect.arrayContaining( args ) );

          return retVal;
        }
      }

      return events.addListener('foo', fnGenerator(1)).then(() => {
        return events.emit('foo', 'a', 'b', 'c', 'd').then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([ 1 ]) );

        }).then(events.on('foo', fnGenerator(2))).then(() => {
          return events.emit('foo', 'a', 'b', 'c', 'd').then((results) => {

            expect( results ).toHaveLength(2);
            expect( results ).toEqual( expect.arrayContaining([ 1, 2 ]) );

          });
        });
      });
    });

  });


  describe("Emitting event once", () => {

    it("should emit 'newListener'", () => {
      let events = new Emitter();
      let fnFoo = function foo() {};
      let fnBar = function bar() {};
      let listeners = {};

      return events.addListener('newListener', (type, listener) => {
        listeners[type] = listener;
      }).then(() => {
        return events.once('foo', fnFoo).then(events.on('bar', fnBar)).then(() => {

          expect( listeners ).toHaveProperty('foo', fnFoo);
          expect( listeners ).toHaveProperty('bar', fnBar);

        });
      });
    });


    it("should emit 'removeListener'", () => {
      let events = new Emitter();
      let fn = () => {};
      let listeners = { 'foo': fn };

      return events.addListener('removeListener', (type, listener) => {
        expect( listener ).toEqual( listeners[type] );

        listeners[type] = false;
      }).then(() => {
        return events.once('foo', fn).then(() => {
          return events.removeListener('foo', fn).then(() => {

            expect( listeners ).toHaveProperty('foo', false);

          });
        });
      });
    });


    it("should emit 'newListener' only once", () => {
      let events = new Emitter();
      let fn = () => {};
      let newHandlerCount = 0;

      return events.once('newListener', (type, listener) => {
        ++newHandlerCount;
      }).then(() => {
        expect( newHandlerCount ).toBe(0);
        expect( events._eventsCount ).toBe(1);

        return events.on('foo', fn).then(events.on('foo', fn)).then(() => {

          expect( newHandlerCount ).toBe(1);
          expect( events._eventsCount ).toBe(2);

        });
      });

    });


    it("should emit with no arguments", () => {
      let events = new Emitter();
      let fn = function () {
        expect( arguments ).toHaveLength(0);
      };

      return events.once('foo', fn).then(() => {
        expect( events._events ).toHaveProperty('foo');
        expect( events._events.foo ).toBeInstanceOf(Function);

        return events.emit('foo').then((results) => {

          expect( results ).toHaveLength(1);
          expect( events._events ).not.toHaveProperty('foo');

          return events.once('foo', fn).then(events.once('foo', fn)).then(() => {
            expect( events._events ).toHaveProperty('foo');
            expect( events._events.foo ).toHaveLength(2);

            return events.emit('foo').then((results) => {

              expect( results ).toHaveLength(2);
              expect( events._events ).not.toHaveProperty('foo');
            });
          });
        });
      });
    });


    it("should emit with one argument", () => {
      let events = new Emitter();
      let a = 'Hello';
      let fn = function (arg1) {
        expect( arguments ).toHaveLength(1);
        expect( arg1 ).toBe(a);

        return arg1;
      };

      return events.once('foo', fn).then(() => {
        return events.emit('foo', a).then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([ a ]) );

          expect( events._events ).not.toHaveProperty('foo');

          return events.once('foo', fn).then(events.once('foo', fn)).then((results) => {
            return events.emit('foo', a).then((results) => {

              expect( results ).toHaveLength(2);
              expect( results ).toEqual( expect.arrayContaining([ a ]) );
    
              expect( events._events ).not.toHaveProperty('foo');

            });
          });
        });
      });
    });


    it("should emit with two argument", () => {
      let events = new Emitter();
      let a = 'Hello';
      let b = 'World';
      let fn1 = function (arg1, arg2) {
        expect( arguments ).toHaveLength(2);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);

        return arg1;
      };
      let fn2 = function (arg1, arg2) {
        expect( arguments ).toHaveLength(2);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);

        return arg2;
      };

      return events.once('foo', fn1).then(() => {
        return events.emit('foo', a, b).then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([ a ]) );

          expect( events._events ).not.toHaveProperty('foo');

          return events.once('foo', fn1).then(events.once('foo', fn2)).then((results) => {
            return events.emit('foo', a, b).then((results) => {

              expect( results ).toHaveLength(2);
              expect( results ).toEqual( expect.arrayContaining([ a, b ]) );
    
              expect( events._events ).not.toHaveProperty('foo');

            });
          });
        });
      });
    });


    it("should emit with three argument", () => {
      let events = new Emitter();
      let a = 'Hello';
      let b = 'World';
      let c = '!!';
      let fn1 = function (arg1, arg2, arg3) {
        expect( arguments ).toHaveLength(3);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);
        expect( arg3 ).toBe(c);

        return arg1;
      };
      let fn2 = function (arg1, arg2, arg3) {
        expect( arguments ).toHaveLength(3);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);
        expect( arg3 ).toBe(c);

        return arg2;
      };
      let fn3 = function (arg1, arg2, arg3) {
        expect( arguments ).toHaveLength(3);
        expect( arg1 ).toBe(a);
        expect( arg2 ).toBe(b);
        expect( arg3 ).toBe(c);

        return arg3;
      };

      return events.once('foo', fn1).then(() => {
        return events.emit('foo', a, b, c).then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([ a ]) );

          expect( events._events ).not.toHaveProperty('foo');

          return events.once('foo', fn1).then(events.once('foo', fn2)).then(() => {
            return events.emit('foo', a, b, c).then((results) => {

              expect( results ).toHaveLength(2);
              expect( results ).toEqual( expect.arrayContaining([ a, b ]) );
    
              expect( events._events ).not.toHaveProperty('foo');

              return events.once('foo', fn1).then(events.once('foo', fn2)).then(events.once('foo', fn3)).then(() => {
                return events.emit('foo', a, b, c).then((results) => {

                  expect( results ).toHaveLength(3);
                  expect( results ).toEqual( expect.arrayContaining([ a, b, c ]) );
        
                  expect( events._events ).not.toHaveProperty('foo');

                });
              });
            });
          });
        });
      });
    });


    it("should emit with many argument", () => {
      let events = new Emitter();
      let expectedArgs = ['a', 'b', 'c', 'd'];
      function fnGenerator(retVal) {
        return (...args) => {
          expect( args ).toHaveLength(expectedArgs.length);
          expect( args ).toEqual( expect.arrayContaining(expectedArgs) );

          return retVal;
        }
      }

      return events.once('foo', fnGenerator(1)).then(() => {
        return events.emit('foo', 'a', 'b', 'c', 'd').then((results) => {

          expect( results ).toHaveLength(1);
          expect( results ).toEqual( expect.arrayContaining([ 1 ]) );

          expect( events._events ).not.toHaveProperty('foo');

          return events.once('foo', fnGenerator(1)).then(events.once('foo', fnGenerator(2))).then(() => {
            return events.emit('foo', 'a', 'b', 'c', 'd').then((results) => {

              expect( results ).toHaveLength(2);
              expect( results ).toEqual( expect.arrayContaining([ 1, 2 ]) );

              expect( events._events ).not.toHaveProperty('foo');
            });
          });
        });
      });
    });

    it('should resolve promises created by .once(type)', function() {
      let events = new Emitter();

      return new Promise((resolve, reject) => {
        events.once('foo').then(resolve, reject);

        events.emit('foo').catch(reject);
      });
    });
  });



  describe('Test errors', () => {


    it('should reject error instance when no error listeners', () => {
      let events = new Emitter();

      return events.emit('error', new Error('Test Error')).then(() => {
        throw new Error('Failed test');
      }, (err) => {
        expect( err ).toBeInstanceOf(Error);
        expect( err.message ).toEqual( 'Test Error' );
      });
    });

    it('should reject error string when no error listeners', () => {
      let events = new Emitter();

      return events.emit('error', 'Test string').then(() => {
        throw new Error('Failed test');
      }, (err) => {
        expect( err ).toBeInstanceOf(Error);
        expect( err.message ).toEqual( 'Uncaught, unspecified "error" event. (Test string)' );
      });
    });

    it('should reject undefined error when no error listeners', () => {
      let events = new Emitter();

      return events.emit('error').then(() => {
        throw new Error('Failed test');
      }, (err) => {
        expect( err ).toBeInstanceOf(Error);
        expect( err.message ).toEqual( 'Uncaught, unspecified "error" event.' );
      });
    });

    it('should reject even with undefined _events', () => {
      let events = new Emitter();

      events._events = null;

      return events.emit('error').then(() => {
        throw new Error('Failed test');
      }, (err) => {
        expect( err ).toBeInstanceOf(Error);
        expect( err.message ).toEqual( 'Uncaught, unspecified "error" event.' );
      });
    });

  });


  it('should resolve on missing listeners', () => {
    let events = new Emitter();

    return events.emit('missing');
  });

  it('should resolve on missing listeners with undefined _events', () => {
    let events = new Emitter();

    events._events = null;

    return events.emit('missing');
  });

});
