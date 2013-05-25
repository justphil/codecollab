'use strict';

angular.module('codecollabUiApp')
    .directive('ace', function () {
        return {
            template: '<div></div>',
            restrict: 'E',
            scope: {
                initCode:           '=',
                editorId:           '@',
                theme:              '@',
                mode:               '@',
                onChange:           '&',
                onChangeCursor:     '&',
                onChangeSelection:  '&'
            },
            controller: ['$scope', 'aceManager', function($scope, aceManager) {
                $scope.registerAceInstance = function (elementId, aceInstance) {
                    return aceManager.registerAceInstance(elementId, aceInstance);
                };
            }],
            link: function postLink($scope, $element, $attrs) {
                if (angular.isUndefined(window.ace)) {
                    $element.text('Ace editor library is not included!');
                    return;
                }

                var isEditorIdSet = false;
                $scope.editor = null;

                var resizeHeight = function(editorId) {
                    var winHeight = angular.element(window).height() - 40;
                    angular.element('#' + editorId).height(winHeight);
                };

                var initAceInstance = function(editorId) {
                    var editor, session;
                    
                    $element.children().attr('id', editorId);
                    editor  = ace.edit(editorId);
                    session = editor.getSession();

                    editor.setTheme($scope.theme);
                    session.setMode($scope.mode);


                    editor.setValue($scope.initCode);
                    editor.navigateDown(100); // Doesn't seem to work right!

                    // only for test purposes

                    var Range = window.ace.require('ace/range').Range;
                    editor.getSession().addMarker(
                        new Range(0, 0, 3, 3), "ace_selection red", "text", true
                    );

                    var annotationMessage = "More to come! As well as code annotations like this. Stay tuned!";
                    session.setAnnotations([{row:13, column: 0, text: annotationMessage, type:"warning"}]);
                    /*
                    var Range = window.ace.require('ace/range').Range;
                    session.addMarker(
                        new Range(1, 0, 1, 1), "ace_cursor red", "text", true
                    );
                    */
                    //console.log('marker added');
                    //console.log('markers:', editor.getSession().getMarkers(true));
                    // till here

                    angular.element(window).resize(function() {
                        resizeHeight(editorId);
                    });

                    resizeHeight(editorId);

                    // only a hack for fade in sfx after editor is loaded
                    var mainStage = angular.element('.main-stage');
                    if (mainStage.length) {
                        mainStage.addClass('active');
                    }

                    var header = angular.element('header');
                    if (header.length) {
                        header.addClass('active');
                    }

                    /*
                    var header = angular.element('header');
                    if (header.length) {
                        header.css('top', 0);
                    }
                    */

                    session.on('change', function(e) {
                        if ($scope.onChange && editor.isChangeEventsEnable()) {
                            var d       = e.data;
                            var action  = d.action;
                            var text    = d.text;
                            var lines   = d.lines;
                            var start   = d.range.start;
                            var end     = d.range.end;

                            // TODO: The emitted event can vary, e.g. if action is 'removeLines'
                            $scope.onChange({
                                action: action, text: text, lines: lines, startRow: start.row, startColumn: start.column,
                                endRow: end.row, endColumn: end.column
                            });
                        }
                    });

                    session.selection.on('changeCursor', function(e) {
                        if ($scope.onChangeCursor) {
                            var newPos = session.selection.getCursor();
                            $scope.onChangeCursor({
                                action: e.type, row: newPos.row, column: newPos.column
                            });
                        }
                    });

                    session.selection.on('changeSelection', function(e) {
                        if ($scope.onChangeSelection) {
                            var range = session.selection.getRange();
                            $scope.onChangeSelection({
                                action: e.type,
                                startRow: range.start.row, startColumn: range.start.column,
                                endRow: range.end.row, endColumn: range.end.column
                            });
                        }
                    });

                    $scope.$watch('initCode', function(newValue, oldValue) {
                        if (newValue !== oldValue) {
                            editor.disableChangeEvents();
                            editor.setValue(newValue);
                            editor.navigateDown(100); // Doesn't seem to work right!
                            editor.enableChangeEvents();
                        }
                    });
                    
                    return editor;
                };

                // editorId property is not available immediately, therefore we need to observe its value
                // and trigger initialization if the value is available.
                // We cannot use the compile function to transform the template because the transformed
                // template would be part of every directive instance. But we want the instances to have
                // separate DOM ids.
                $attrs.$observe('editorId', function(value) {
                    if (!isEditorIdSet) {
                        console.log('editorId has changed value to ' + value);
                        var editor = initAceInstance(value);
                        $scope.editor = editor;
                        isEditorIdSet = $scope.registerAceInstance(value, editor);
                    }
                });

                $attrs.$observe('theme', function(value) {
                    if (isEditorIdSet) {
                        console.log('theme has changed value to ' + value);
                        $scope.editor.setTheme(value);
                    }
                });

                $attrs.$observe('mode', function(value) {
                    if (isEditorIdSet) {
                        console.log('mode has changed value to ' + value);
                        $scope.editor.getSession().setMode(value);
                    }
                });

                // Only to demonstrate that isolated scope properties are not available within the linkFn immediately
                console.log('editorId: ' + $scope.editorId);
                console.log('aceTheme: ' + $scope.theme);
                console.log('aceMode: ' + $scope.mode);
            }
        };
    });
