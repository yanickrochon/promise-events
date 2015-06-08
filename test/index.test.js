

describe("Test Promise Events Emitter", function () {

  var Emitter = require('../index');
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

  it("should emit 'newListener'", function (done) {
    var events = new Emitter();
    var fnFoo = function foo() {};
    var fnBar = function bar() {};
    var listeners = {};

    this.timeout(1000);

    events.addListener('newListener', function (type, listener) {
      listeners[type] = listener;
    }).then(function () {
      return events.addListener('foo', fnFoo).then(events.addListener('bar', fnBar)).then(function () {

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
      return events.addListener('foo', fn).then(events.removeListener('foo', fn)).then(function () {

        listeners.should.have.ownProperty('foo').and.equal(false);

      });
    }).then(done).catch(done);
  });

  it("should use domain events");

  it("should detect memory leak");


  describe("Emitting events", function () {

    it("should emit with no arguments", function (done) {
      var events = new Emitter();
      var fn = function () {
        arguments.should.have.lengthOf(0);
      };

      this.timeout(1000);

      events.addListener('foo', fn).then(function () {
        return events.emit('foo').then(function (results) {

          results.should.be.an.Array.of.length(1);
          should(results[0]).be.undefined;

        }).then(events.addListener('foo', fn)).then(function () {
          return events.emit('foo').then(function (results) {

            results.should.be.an.Array.of.length(2);
            should(results[0]).be.undefined;
            should(results[1]).be.undefined;
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

          results.should.be.an.Array.of.length(1);
          should(results[0]).equal(a);

        }).then(events.addListener('foo', fn)).then(function () {
          return events.emit('foo', a).then(function (results) {

            results.should.be.an.Array.of.length(2);
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

          results.should.be.an.Array.of.length(1);
          should(results[0]).equal(a);

        }).then(events.addListener('foo', fn2)).then(function () {
          return events.emit('foo', a, b).then(function (results) {

            results.should.be.an.Array.of.length(2);
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

          results.should.be.an.Array.of.length(1);
          should(results[0]).equal(a);

        }).then(events.addListener('foo', fn2)).then(function () {
          return events.emit('foo', a, b, c).then(function (results) {

            results.should.be.an.Array.of.length(2);
            should(results[0]).equal(a);
            should(results[1]).equal(b);

          }).then(events.addListener('foo', fn3)).then(function () {
            return events.emit('foo', a, b, c).then(function (results) {

              results.should.be.an.Array.of.length(3);
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

          results.should.be.an.Array.of.length(1);
          should(results[0]).equal(1);

        }).then(events.addListener('foo', fnGenerator(2))).then(function () {
          return events.emit('foo', 'a', 'b', 'c', 'd').then(function (results) {

            results.should.be.an.Array.of.length(2);
            should(results[0]).equal(1);
            should(results[1]).equal(2);

          });
        });
      }).then(done).catch(done);
    });

  });


  describe("Emitting event once", function () {

    it("should emit with no arguments");

    it("should emit with one argument");

    it("should emit with two argument");

    it("should emit with three argument");

    it("should emit with many argument");

  });


});