(function() {

  var app = angular.module('Controllers', []);

  //Main Controller
  app.controller('MainController', ['$rootScope','$scope','RepoService', function($rootScope,$scope,Repo) {
    var packs_loaded = false;

    //order
    $rootScope.$on('list-order-change', function( evt, orderby ) {
      //console.log('change order', orderby);
      $scope.orderby = orderby;
    });

    //filter
    $rootScope.$on('list-filter-change', function( evt, filterby ) {
      //console.log('change filter', filterby);
      $('#queryFld').focus();
      $scope.filterby = { author: filterby };
    });

    //query
    $rootScope.$on('list-query-change', function( evt, filterby ) {
      //console.log('change query', filterby );
      $scope.filterby = filterby;
    });

    //SERVICE TEST
    $rootScope.$on('packages-loaded', function( evt, packages ) {
      //console.log('Repo Loaded!');

      $scope.packages = packages;

      $scope.orderby = 'pack_name';
      $scope.filterby = '';
    });

    //build repo object
    if ( !packs_loaded ) {
      //console.log( "Loading Repo" );
      packs_loaded = true;
      Repo.loadRepo();
    };

  }]);

  //Sidebar Controller
  app.controller('SidebarController', ['$scope','$rootScope','RepoService',function($scope,$rootScope,repo) {

    $scope.filterAuthor = function( author ) {
      $rootScope.$emit('list-filter-change', author );
    };

    $rootScope.$on('packages-loaded', function( evt ) {
      //console.log('Sidebar Go');
      
      var r = repo.getRepo();
      var authors = Object.keys( r );
      
      $scope.authors = authors;
    });

  }]);

  //Sort
  app.controller('ButtonsController', ['$rootScope','$scope', function($rootScope,$scope){
    
    $scope.radioModel = 'pack_name';

    $scope.changeOrder = function( orderby ) {
      //console.log( orderby );
      $rootScope.$emit('list-order-change', orderby );
    };

  }]);

  //Package Controller
  app.controller('PackageController', ['$scope','$http','Cart','ModalService', function($scope,$http,Cart,Modal) {

    $scope.show_version_btn = true;

    $scope.packs_loaded = false;
    $scope.packs_loading = false;

    $scope.showVersions = function( link, author, pack_name ) {

      $scope.show_version_btn = false;

      $scope.packs_loading = true;

      $http.get( link ).then( function( result ) {
        var data = result.data;
        var versions = [];

        var len = Object.keys(data).length;
        angular.forEach( Object.keys(data), function( version ) {
          len = len - 1;

          $scope.ischecked = false;

          versions.push( { version: version, link: data[ version ] } );

          if (len <= 0) {
            var pack_path = author + '/' + pack_name + '@' + version
            //check it
            if ( Cart.inCart( pack_path ) ) {
              $scope.ischecked = true;
            };
          };
        });

        $scope.pack_versions = versions;

        $scope.packs_loaded = true;
        $scope.packs_loading = false;

      }, function( err ) {
        //console.log( err );
      });
    };

    $scope.togglePackage = function( evt, package, pack ) {
      var path = package.author + '/' + package.pack_name + '@' + pack.version;
      Cart.addCart( path );
    };

    $scope.showBlob = function( blob_url ) {

      Modal.showModal({
          templateUrl: './html/blob.html',
          controller: 'BlobController',
          inputs: {
            blob_url: blob_url
          }
        }).then( function( modal ) {
          modal.element.modal();
          modal.close.then( function( result ) {
            //console.log( result );
          });
        });
      };
  }]);

  //Modal
  app.controller('ModalController', ['$scope','Cart','pack_cart','close', function($scope,Cart,pack_cart,close) {

    //console.log( pack_cart );
    var code = 'return {' + "\r\n";
    code = code + ' name = "lit/package",' + "\r\n";
    code = code + ' version = "0.0.0",' + "\r\n";
    code = code + ' dependencies = {' + "\r\n";
    angular.forEach( pack_cart, function( pack_id, pack_path ) {
      code = code + "   " + '"' + pack_path + '"' + ',' + "\r\n";
    });
    code = code + ' },' + "\r\n";
    code = code + ' files = {' + "\r\n";
    code = code + '  "**.lua",' + "\r\n";
    code = code + '  "!test*"' + "\r\n";
    code = code + ' }' + "\r\n";
    code = code + '}';

    $scope.cart = code;

    $scope.close = function(result) {
      //console.log( result );
      if ( result == 'clear' ) {
        Cart.clearCart();
      };
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };

  }]);

  //Blob Modal
  app.controller('BlobController',['$scope','$http','$filter','blob_url','close',function($scope,$http,$filter,blob_url,close) {

    $http.get( blob_url ).then( function( result ) {
      //console.log( result );
      $scope.blob = $filter('json')( result.data );
    }, function( err ) {
      //console.log( err );
    });

    $scope.close = function( result ) {
      //console.log( result );
      close( result, 500 );
    };

  }]);


})();