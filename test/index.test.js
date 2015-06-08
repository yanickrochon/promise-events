

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

    it("should emit with no arguments");

    it("should emit with one argument");

    it("should emit with two argument");

    it("should emit with three argument");

    it("should emit with many argument");

  });


  describe("Emitting event once", function () {

    it("should emit with no arguments");

    it("should emit with one argument");

    it("should emit with two argument");

    it("should emit with three argument");

    it("should emit with many argument");

  });


});