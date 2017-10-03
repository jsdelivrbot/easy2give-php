e2gApp.controller('importProviderNumbersCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
    $scope.matchesFound = 0;
    $scope.importedFiles = 0;
    $scope.checked = 0;
    $scope.all = 0;
    $scope.coupleIds = [];
    $scope.duplicates = [];
    $scope.parseDuplicates = [];

    $scope.loadFile = function($files, $file, $newFiles, $duplicateFiles,
                               $invalidFiles, $event) {
      if ($event.originalEvent.target.files &&
          $event.originalEvent.target.files.length !== 0) {
        alasql('SELECT * FROM FILE(?,{headers:true})', [$event.originalEvent],
            function(data) {
              $timeout(function() {
                $scope.importedFiles++;
                $scope.duplicates = [];
                $scope.parseDuplicates = [];
              }, 0);
              findColumnsNames(data, function(passportId, providerNumber) {
                var passportIds = [];
                var duplicates = {};

                // check for duplicates in imported file
                data.forEach(function(row) {
                  // if passport id does not exist in passportIds arr and in duplicates
                  // then it means that we see this passport id first time.
                  if (passportIds.indexOf(row[passportId]) == -1 && !duplicates[row[passportId]]) {
                    passportIds.push(row[passportId]);
                  } else {
                    // if we are here then it means that passport id has duplicates
                    // and we should remove it from array
                    if (passportIds.indexOf(row[passportId]) !== -1) {
                      passportIds.splice(passportIds.indexOf(row[passportId]), 1);
                    }

                    if (duplicates[row[passportId]]) {
                      // if passport id is already in duplicates then add it provider number to duplicate's object
                      duplicates[row[passportId]].providerNumbers.push(row[providerNumber]);
                    } else {
                      // create duplicate object
                      duplicates[row[passportId]] = {
                        providerNumbers: [row[providerNumber]]
                      };
                    }
                  }
                });

                $timeout(function() {
                  $scope.all = passportIds.length;
                  $scope.duplicates = duplicates;
                });
                data.forEach(function(row) {
                  $timeout(function() {
                    // don't check ids when it has duplicate
                    if (!$scope.duplicates[row[passportId]]) {
                      checkIds(row[passportId], row[providerNumber]);
                    }
                  }, 100);
                });
              });
            });
      }
    };

    $scope.$watch('importedFiles', function() {
      $scope.checked = 0;
      $scope.matchesFound = 0;
    });

    function findColumnsNames(data, callback) {
      var passportId;
      var providerNumber;
      for (var key in data[0]) {
        if (key.match(/\./)) {
          passportId = key;
        } else if (typeof data[0][key] === 'number') {
          providerNumber = key;
        }
      }

      if (callback) {
        callback(passportId, providerNumber);
      }
    }

    function checkIds(passportId, providerNumber) {
      var event = Parse.Object.extend('Event');
      var firstPassportIdQuery = new Parse.Query(event);
      firstPassportIdQuery.equalTo('firstPassportId',
          passportId.toString());
      var secondPassportIdQuery = new Parse.Query(event);
      secondPassportIdQuery.equalTo('secondPassportId',
          passportId.toString());

      var mainQuery = Parse.Query.or(firstPassportIdQuery,
          secondPassportIdQuery);

      doQuery(mainQuery);

      var errorCount = 0;

      function doQuery(query) {
        query.find({
          success: function(res) {
            $timeout(function() {
              $scope.checked++;
            }, 0);
            if (res.length === 0) {
              return;
            } else if (res.length > 1) {
              // if res arr has more then 1 event then we should do nothing
              $timeout(function() {
                $scope.parseDuplicates.push(res);
              });
              return;
            }
            res.forEach(function(obj) {
              obj.set('showBanner', true);
              obj.set('providerNumber', providerNumber.toString());
              obj.save(null, {
                success: function(obj) {
                  $timeout(function() {
                    $scope.coupleIds.push(obj.toJSON().coupleId);
                    $scope.matchesFound++;
                  }, 0);
                }
              });
            });
          },
          error: function(error) {
            errorCount++;
            if (errorCount > 3) {
              return;
            }
            doQuery(query);
          }
        });
      }
    }

  }]);
