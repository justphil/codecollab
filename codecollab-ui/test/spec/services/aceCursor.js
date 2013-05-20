'use strict';

describe('Service: aceCursor', function () {

  // load the service's module
  beforeEach(module('codecollabUiApp'));

  // instantiate service
  var aceCursor;
  beforeEach(inject(function (_aceCursor_) {
    aceCursor = _aceCursor_;
  }));

  it('should do something', function () {
    expect(!!aceCursor).toBe(true);
  });

});
