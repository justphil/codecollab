'use strict';

describe('Service: aceManager', function () {

  // load the service's module
  beforeEach(module('codecollabUiApp'));

  // instantiate service
  var aceManager;
  beforeEach(inject(function (_aceManager_) {
    aceManager = _aceManager_;
  }));

  it('should do something', function () {
    expect(!!aceManager).toBe(true);
  });

});
