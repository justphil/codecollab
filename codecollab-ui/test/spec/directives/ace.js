'use strict';

describe('Directive: ace', function () {
  beforeEach(module('codecollabUiApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<ace></ace>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the ace directive');
  }));
});
