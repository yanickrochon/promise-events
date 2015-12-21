
'use strict';

describe("Test resultFilter", function () {

  const Emitter = require('../emitter');
  let _resultFilter;

  before(function () {
    _resultFilter = Emitter.defaultResultFilter;
  });

  after(function () {
    Emitter.defaultResultFilter = _resultFilter;
  });


  it('should throw when adding invalid filters', function () {
    let events = new Emitter();

    [
      true, 'foo', /./, 42, {}, [], -1
    ].forEach(function (n) {
      !function () { events.resultFilter = n; }.should.throw('filter must be a function');
    });
  });


  it('should reciprocate', function () {
    let events = new Emitter();
    
    (typeof events.getResultFilter()).should.equal('undefined');

    const exampleFilter = function() { return true; };
    Emitter.defaultResultFilter = exampleFilter;
    Emitter.defaultResultFilter.should.equal(exampleFilter);

    events.resultFilter = undefined;
    events.resultFilter.should.equal(Emitter.defaultResultFilter);

    Emitter.defaultMaxListeners = undefined;
    (typeof Emitter.defaultMaxListeners).should.equal('undefined');
    (typeof events.maxListeners).should.equal('undefined');
  });
});
