'use strict';

describe('Service: ccSession', function () {

  // load the service's module
  beforeEach(module('codecollabUiApp'));

  // instantiate service
  var ccSession;
  beforeEach(inject(function (_ccSession_) {
    ccSession = _ccSession_;
  }));

  it('should do something', function () {
    expect(!!ccSession).toBe(true);
  });

});
