

describe("Test Promise Events Emitter", function () {

  var Emitter = require('../emitter');
  var should = require('should');


  it("should provide standard emitter interface", function () {
    var events = new Emitter();

    Emitter.prototype.getMaxListeners.should.be.a.Function;
    Emitter.prototype.setMaxListeners.should.be.a.Function;
    Emitter.prototype.emit.should.be.a.Function;
    Emitter.prototype.addListener.should.be.a.Function;
    Emitter.prototype.on.should.be.a.Function;
    Emitter.prototype.once.should.be.a.Function;
    Emitter.prototype.removeListener.should.be.a.Function;
    Emitter.prototype.removeAllListeners.should.be.a.Function;
    Emitter.prototype.listeners.should.be.a.Function;

    events.getMaxListeners.should.be.a.Function;
    events.setMaxListeners.should.be.a.Function;
    events.emit.should.be.a.Function;
    events.addListener.should.be.a.Function;
    events.on.should.be.a.Function;
    events.once.should.be.a.Function;
    events.removeListener.should.be.a.Function;
    events.removeAllListeners.should.be.a.Function;
    events.listeners.should.be.a.Function;

    events.hasOwnProperty('_events');
    events.hasOwnProperty('_maxListeners');
  });


  it("should add and remove listeners", function (done) {
    var events = new Emitter();
    var fn = function () {};

    this.timeout(1000);

    events._eventsCount.should.equal(0);

    events.addListener('foo', fn).then(function () {
      events._eventsCount.should.equal(1);
      events._events['foo'].should.equal(fn);

      return events.addListener('foo', fn);
    }).then(function () {
      events._eventsCount.should.equal(2);
      events._events['foo'].should.eql([fn, fn]);

      return events.removeListener('foo', fn);
    }).then(function () {
      events._eventsCount.should.equal(1);
      events._events['foo'].should.equal(fn);

      return events.removeListener('foo', fn);
    }).then(function () {
      events._eventsCount.should.equal(0);
      events._events.should.eql({});

    }).then(done).catch(done);
  });


  it("should not add invalid listeners", function (done) {
    var events = new Emitter();

    Promise.all([undefined, null, false, true, -1, 0, 1, '', {}, [], /./].map(function (invalid) {
      try {
        events.on('foo', invalid).then(function () {
          throw new Error("Should not allow adding invalid listener : " + invalid);
        });
      } catch (e) {
        // all good!
      }

      try {
        events.once('foo', invalid).then(function () {
          throw new Error("Should not allow adding invalid once listener : " + invalid);
        });
      } catch (e) {
        // all good!
      }

    })).then(function () {
      done();
    }).catch(done);
  });


  it("should not remove invalid listeners", function (done) {
    var events = new Emitter();

    Promise.all([undefined, null, false, true, -1, 0, 1, '', {}, [], /./].map(function (invalid) {
      try {
        events.removeListener('foo', invalid).then(function () {
          throw new Error("Should not allow removing invalid listener : " + invalid);
        });
      } catch (e) {
        // all good!
      }
    })).then(function () {
      done();
    }).catch(done);
  });


  it("should remove all listeners", function (done) {
    var events = new Emitter();
    var fn = function () {};

    this.timeout(1000);

    events.addListener('foo', fn).then(events.on('foo', fn)).then(events.addListener('foo', fn)).then(function () {

      events._events.should.have.ownProperty('foo');
      events._eventsCount.should.equal(3);
      events._events['foo'].should.be.an.instanceOf(Array).and.have.lengthOf(3);

      return events.removeAllListeners('foo').then(function () {
        events._events.should.not.have.ownProperty('foo');
        events._eventsCount.should.equal(0);
        events.listeners('foo').should.be.an.instanceOf(Array).and.have.lengthOf(0);

        return events.addListener('foo', fn).then(function () {
          events._eventsCount.should.equal(1);
          events._events['foo'].should.be.a.Function;
          events.listeners('foo').should.be.an.instanceOf(Array).and.have.lengthOf(1);

          return events.removeAllListeners('foo').then(function () {
            events._events.should.not.have.ownProperty('foo');
            events._eventsCount.should.equal(0);

            return events.removeAllListeners('foo').then(function () {

              Emitter.listenerCount(events, 'bar').should.equal(0);

              return events.removeListener('bar', fn).then(function () {

                events._events = undefined;
                events._eventsCount = 0;

                events.listeners('foo').should.be.an.instanceOf(Array).and.have.lengthOf(0);
                Emitter.listenerCount(events, 'foo').should.equal(0);

                return events.removeListener('foo', fn).then(events.removeAllListeners());
              });
            });
          });
        });
      });
    }).then(done).catch(done);
  });



  it("should use domain events");


  it("should detect memory leak", function () {
    var events = new Emitter();
    var _error = console.error;
    var _trace = console.trace;
    var errorCount = 0;
    var traceCount = 0;

    console.error = function () {
      ++errorCount;
    };
    console.trace = function () {
      ++traceCount;
    };

    for (var i = 0; i < events.maxListeners + 2; ++i) {
      events.listeners('test').length.should.equal(i);
      events.on('test', function () {});
    }

    events.listeners('test').length.should.equal(events.maxListeners + 2);

    errorCount.should.equal(1);
    traceCount.should.equal(1);

    events.removeAllListeners();
    events.listeners('test').length.should.equal(0);

    console.error = _error;
    console.trace = _trace;
  });


  it("should handle emitted errors", function (done) {
    var events = new Emitter();

    events.on('foo', function () {
      throw new Error('Test');
    }).then(function () {

      Promise.all([
        events.emit('foo').then(function () {
          throw new Error('Failed test');
        }, function (err) {
          err.message.should.equal('Test');
        }),
        events.emit('foo', 1).then(function () {
          throw new Error('Failed test');
        }, function (err) {
          err.message.should.equal('Test');
        }),
        events.emit('foo', 1, 2).then(function () {
          throw new Error('Failed test');
        }, function (err) {
          err.message.should.equal('Test');
        }),
        events.emit('foo', 1, 2, 3).then(function () {
          throw new Error('Failed test');
        }, function (err) {
          err.message.should.equal('Test');
        }),
        events.emit('foo', 1, 2, 3, 4).then(function () {
          throw new Error('Failed test');
        }, function (err) {
          err.message.should.equal('Test');
        })
      ]).then(function () {
        done();
      }).catch(done);

    });

  });


  describe("Emitting events", function () {

    it("should emit 'newListener'", function (done) {
      var events = new Emitter();
      var fnFoo = function foo() {};
      var fnBar = function bar() {};
      var listeners = {};

      this.timeout(1000);

      events.addListener('newListener', function (type, listener) {
        listeners[type] = listener;
      }).then(function () {
        return events.addListener('foo', fnFoo).then(events.on('bar', fnBar)).then(function () {

          listeners.should.have.ownProperty('foo').and.equal(fnFoo);
          listeners.should.have.ownProperty('bar').and.equal(fnBar);

        });
      }).then(done).catch(done);
    });


    it("should emit 'removeListener'", function (done) {
      var events = new Emitter();
      var fn = function () {};
      var listeners = { 'foo': fn };

      this.timeout(1000);

      events.addListener('removeListener', function (type, listener) {
        listener.should.equal(listeners[type]);

        listeners[type] = false;
      }).then(function () {
        return events.on('foo', fn).then(function () {
          return events.removeListener('foo', fn).then(function () {

            listeners.should.have.ownProperty('foo').and.equal(false);

          });
        });
      }).then(done).catch(done);
    });


    it("should emit with no arguments", function (done) {
      var events = new Emitter();
      var fn = function () {
        arguments.should.have.lengthOf(0);
      };

      this.timeout(1000);

      events.addListener('foo', fn).then(function () {
        return events.emit('foo').then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(0);

          Emitter.listenerCount(events, 'foo').should.equal(1);

          return events.on('foo', fn).then(function () {
            return events.emit('foo').then(function (results) {

              results.should.be.an.instanceOf(Array).and.have.lengthOf(0);

              events.listeners('foo').should.be.an.instanceOf(Array).and.have.lengthOf(2);
              Emitter.listenerCount(events, 'foo').should.equal(2);

            });
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with one argument", function (done) {
      var events = new Emitter();
      var a = 'Hello';
      var fn = function (arg1) {
        arguments.should.have.lengthOf(1);

        arg1.should.equal(a);

        return arg1;
      };

      this.timeout(1000);

      events.addListener('foo', fn).then(function () {
        return events.emit('foo', a).then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(a);

        }).then(events.on('foo', fn)).then(function () {
          return events.emit('foo', a).then(function (results) {

            results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
            should(results[0]).equal(a);
            should(results[1]).equal(a);
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with two argument", function (done) {
      var events = new Emitter();
      var a = 'Hello';
      var b = 'World';
      var fn1 = function (arg1, arg2) {
        arguments.should.have.lengthOf(2);

        arg1.should.equal(a);
        arg2.should.equal(b);

        return arg1;
      };
      var fn2 = function (arg1, arg2) {
        arguments.should.have.lengthOf(2);

        arg1.should.equal(a);
        arg2.should.equal(b);

        return arg2;
      };

      this.timeout(1000);

      events.addListener('foo', fn1).then(function () {
        return events.emit('foo', a, b).then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(a);

        }).then(events.on('foo', fn2)).then(function () {
          return events.emit('foo', a, b).then(function (results) {

            results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
            should(results[0]).equal(a);
            should(results[1]).equal(b);
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with three argument", function (done) {
      var events = new Emitter();
      var a = 'Hello';
      var b = 'World';
      var c = '!!';
      var fn1 = function (arg1, arg2, arg3) {
        arguments.should.have.lengthOf(3);

        arg1.should.equal(a);
        arg2.should.equal(b);
        arg3.should.equal(c);

        return arg1;
      };
      var fn2 = function (arg1, arg2, arg3) {
        arguments.should.have.lengthOf(3);

        arg1.should.equal(a);
        arg2.should.equal(b);
        arg3.should.equal(c);

        return arg2;
      };
      var fn3 = function (arg1, arg2, arg3) {
        arguments.should.have.lengthOf(3);

        arg1.should.equal(a);
        arg2.should.equal(b);
        arg3.should.equal(c);

        return arg3;
      };

      this.timeout(1000);

      events.addListener('foo', fn1).then(function () {
        return events.emit('foo', a, b, c).then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(a);

        }).then(events.addListener('foo', fn2)).then(function () {
          return events.emit('foo', a, b, c).then(function (results) {

            results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
            should(results[0]).equal(a);
            should(results[1]).equal(b);

          }).then(events.on('foo', fn3)).then(function () {
            return events.emit('foo', a, b, c).then(function (results) {

              results.should.be.an.instanceOf(Array).and.have.lengthOf(3);
              should(results[0]).equal(a);
              should(results[1]).equal(b);
              should(results[2]).equal(c);

            });
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with many argument", function (done) {
      var events = new Emitter();
      var args = ['a', 'b', 'c', 'd'];
      function fnGenerator(retVal) {
        return function () {
          arguments.should.have.lengthOf(args.length);
          Array.prototype.slice.call(arguments).should.eql(args);

          return retVal;
        }
      }

      events.addListener('foo', fnGenerator(1)).then(function () {
        return events.emit('foo', 'a', 'b', 'c', 'd').then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(1);

        }).then(events.on('foo', fnGenerator(2))).then(function () {
          return events.emit('foo', 'a', 'b', 'c', 'd').then(function (results) {

            results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
            should(results[0]).equal(1);
            should(results[1]).equal(2);

          });
        });
      }).then(done).catch(done);
    });

  });


  describe("Emitting event once", function () {

    it("should emit 'newListener'", function (done) {
      var events = new Emitter();
      var fnFoo = function foo() {};
      var fnBar = function bar() {};
      var listeners = {};

      this.timeout(1000);

      events.addListener('newListener', function (type, listener) {
        listeners[type] = listener;
      }).then(function () {
        return events.once('foo', fnFoo).then(events.on('bar', fnBar)).then(function () {

          listeners.should.have.ownProperty('foo').and.equal(fnFoo);
          listeners.should.have.ownProperty('bar').and.equal(fnBar);

        });
      }).then(done).catch(done);
    });


    it("should emit 'removeListener'", function (done) {
      var events = new Emitter();
      var fn = function () {};
      var listeners = { 'foo': fn };

      this.timeout(1000);

      events.addListener('removeListener', function (type, listener) {
        listener.should.equal(listeners[type]);

        listeners[type] = false;
      }).then(function () {
        return events.once('foo', fn).then(function () {
          return events.removeListener('foo', fn).then(function () {

            listeners.should.have.ownProperty('foo').and.equal(false);

          });
        });
      }).then(done).catch(done);
    });


    it("should emit 'newListener' only once", function (done) {
      var events = new Emitter();
      var fn = function () {};
      var newHandlerCount = 0;

      this.timeout(1000);

      events.once('newListener', function (type, listener) {
        ++newHandlerCount;
      }).then(function () {
        newHandlerCount.should.equal(0);
        events._eventsCount.should.equal(1);

        return events.on('foo', fn).then(events.on('foo', fn)).then(function () {

          newHandlerCount.should.equal(1);
          events._eventsCount.should.equal(2);

        });
      }).then(done).catch(done);

    });


    it("should emit with no arguments", function (done) {
      var events = new Emitter();
      var fn = function () {
        arguments.should.have.lengthOf(0);
      };

      this.timeout(1000);

      events.once('foo', fn).then(function () {
        events._events.should.have.ownProperty('foo').and.be.a.Function;

        return events.emit('foo').then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(0);

          events._events.should.not.have.ownProperty('foo');

          return events.once('foo', fn).then(events.once('foo', fn)).then(function () {
            events._events.should.have.ownProperty('foo').and.have.lengthOf(2);

            return events.emit('foo').then(function (results) {

              results.should.be.an.instanceOf(Array).and.have.lengthOf(0);

              events._events.should.not.have.ownProperty('foo');
            });
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with one argument", function (done) {
      var events = new Emitter();
      var a = 'Hello';
      var fn = function (arg1) {
        arguments.should.have.lengthOf(1);

        arg1.should.equal(a);

        return arg1;
      };

      this.timeout(1000);

      events.once('foo', fn).then(function () {
        return events.emit('foo', a).then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(a);

          events._events.should.not.have.ownProperty('foo');

          return events.once('foo', fn).then(events.once('foo', fn)).then(function (results) {
            return events.emit('foo', a).then(function (results) {

              results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
              should(results[0]).equal(a);
              should(results[1]).equal(a);

              events._events.should.not.have.ownProperty('foo');

            });
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with two argument", function (done) {
      var events = new Emitter();
      var a = 'Hello';
      var b = 'World';
      var fn1 = function (arg1, arg2) {
        arguments.should.have.lengthOf(2);

        arg1.should.equal(a);
        arg2.should.equal(b);

        return arg1;
      };
      var fn2 = function (arg1, arg2) {
        arguments.should.have.lengthOf(2);

        arg1.should.equal(a);
        arg2.should.equal(b);

        return arg2;
      };

      this.timeout(1000);

      events.once('foo', fn1).then(function () {
        return events.emit('foo', a, b).then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(a);

          events._events.should.not.have.ownProperty('foo');

          return events.once('foo', fn1).then(events.once('foo', fn2)).then(function (results) {
            return events.emit('foo', a, b).then(function (results) {

              results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
              should(results[0]).equal(a);
              should(results[1]).equal(b);

              events._events.should.not.have.ownProperty('foo');

            });
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with three argument", function (done) {
      var events = new Emitter();
      var a = 'Hello';
      var b = 'World';
      var c = '!!';
      var fn1 = function (arg1, arg2, arg3) {
        arguments.should.have.lengthOf(3);

        arg1.should.equal(a);
        arg2.should.equal(b);
        arg3.should.equal(c);

        return arg1;
      };
      var fn2 = function (arg1, arg2, arg3) {
        arguments.should.have.lengthOf(3);

        arg1.should.equal(a);
        arg2.should.equal(b);
        arg3.should.equal(c);

        return arg2;
      };
      var fn3 = function (arg1, arg2, arg3) {
        arguments.should.have.lengthOf(3);

        arg1.should.equal(a);
        arg2.should.equal(b);
        arg3.should.equal(c);

        return arg3;
      };

      this.timeout(1000);

      events.once('foo', fn1).then(function () {
        return events.emit('foo', a, b, c).then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(a);

          events._events.should.not.have.ownProperty('foo');

          return events.once('foo', fn1).then(events.once('foo', fn2)).then(function () {
            return events.emit('foo', a, b, c).then(function (results) {

              results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
              should(results[0]).equal(a);
              should(results[1]).equal(b);

              events._events.should.not.have.ownProperty('foo');

              return events.once('foo', fn1).then(events.once('foo', fn2)).then(events.once('foo', fn3)).then(function () {
                return events.emit('foo', a, b, c).then(function (results) {

                  results.should.be.an.instanceOf(Array).and.have.lengthOf(3);
                  should(results[0]).equal(a);
                  should(results[1]).equal(b);
                  should(results[2]).equal(c);

                  events._events.should.not.have.ownProperty('foo');

                });
              });
            });
          });
        });
      }).then(done).catch(done);
    });


    it("should emit with many argument", function (done) {
      var events = new Emitter();
      var args = ['a', 'b', 'c', 'd'];
      function fnGenerator(retVal) {
        return function () {
          arguments.should.have.lengthOf(args.length);
          Array.prototype.slice.call(arguments).should.eql(args);

          return retVal;
        }
      }

      events.once('foo', fnGenerator(1)).then(function () {
        return events.emit('foo', 'a', 'b', 'c', 'd').then(function (results) {

          results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          should(results[0]).equal(1);

          events._events.should.not.have.ownProperty('foo');

          return events.once('foo', fnGenerator(1)).then(events.once('foo', fnGenerator(2))).then(function () {
            return events.emit('foo', 'a', 'b', 'c', 'd').then(function (results) {

              results.should.be.an.instanceOf(Array).and.have.lengthOf(2);
              should(results[0]).equal(1);
              should(results[1]).equal(2);

              events._events.should.not.have.ownProperty('foo');
            });
          });
        });
      }).then(done).catch(done);
    });

  });


  describe("Test subclassing", function () {

    it("should create valid instance", function (done) {
      var util = require('util');
      var SubEmitter = function () {};
      var events;

      util.inherits(SubEmitter, Emitter);

      events = new SubEmitter();

      events.should.be.instanceOf(Emitter);

      events.should.not.have.ownProperty('_events');
      events.should.not.have.ownProperty('_eventsCount');

      events.on('foo', function () {}).then(function () {

        events.should.have.ownProperty('_events').and.have.ownProperty('foo').be.a.Function;
        events.should.have.ownProperty('_eventsCount').equal(1);

      }).then(done).catch(done);

    });

  });

});