'use strict';

describe('Directive: collaborators', function () {
  beforeEach(module('codecollabUiApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<collaborators></collaborators>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the collaborators directive');
  }));
});
