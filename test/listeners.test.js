

describe("Test adding and removing listeners", function () {

  var Emitter = require('../emitter');
  var should = require('should');


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

      return events.removeListener('foo', function () {});  // unknown listener
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

      return events.removeListener('buz', fn);
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
        e.message.should.equal('listener must be a function');
      }

      try {
        events.once('foo', invalid).then(function () {
          throw new Error("Should not allow adding invalid once listener : " + invalid);
        });
      } catch (e) {
        e.message.should.equal('listener must be a function');
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
        e.message.should.equal('listener must be a function');
      }
    })).then(function () {
      done();
    }).catch(done);
  });



  it("should remove all listeners", function (done) {
    var events = new Emitter();
    var fn = function () {};

    this.timeout(1000);

    Promise.all([
      events.on('foo', fn),
      events.on('foo', fn),
      events.on('foo', fn),
      events.on('bar', fn),
      events.on('meh', fn)
    ]).then(function () {

      events._events.should.have.ownProperty('foo').and.be.instanceOf(Array).with.lengthOf(3);
      events._events.should.have.ownProperty('bar').and.equal(fn);
      events._events.should.have.ownProperty('meh').and.equal(fn);

      return events.removeAllListeners('foo').then(function () {

        events._events.should.not.have.ownProperty('foo');
        events._events.should.have.ownProperty('bar').and.equal(fn);
        events._events.should.have.ownProperty('meh').and.equal(fn);
        events._eventsCount.should.equal(2);

        return events.removeAllListeners();
      }).then(function () {
        events._events.should.eql({});
        events._eventsCount.should.equal(0);

        return events.on('foo', fn);
      }).then(function () {

        events._events.should.have.ownProperty('foo').and.equal(fn);
        events._eventsCount.should.equal(1);

        return events.removeAllListeners('foo');
      }).then(function () {
        events._events.should.eql({});
        events._eventsCount.should.equal(0);

        return events.on('foo', fn).then(events.on('bar', fn)).then(events.removeAllListeners('foo'));
      }).then(function () {
        events._events.should.not.have.ownProperty('foo');
        events._events.should.have.ownProperty('bar').and.equal(fn);
        events._eventsCount.should.equal(1);

        return events.removeAllListeners('buz');
      }).then(function () {
        events._events.should.have.ownProperty('bar').and.equal(fn);
        events._eventsCount.should.equal(1);

        // hard reset
        events._events = null;
        events._eventsCount = 0;

        return events.removeAllListeners();
      }).then(function () {
        should(events._events).be.null;
        events._eventsCount.should.equal(0);
      })

    }).then(done).catch(done);
  });


  it('should emit removeListener events');


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


});