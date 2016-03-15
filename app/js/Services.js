(function() {

  var app = angular.module('Services', []);

  app.service('Cart', ['$rootScope', function($rootScope) {
    var cart = {};

    this.addCart = function( dep_path ) {
      if ( !cart[ dep_path ] ) {
        cart[ dep_path ] = dep_path;
      } else {
        console.log('already in cart, remove');
        //remove it
        this.removeCart( dep_path );
      };

      $rootScope.$emit('cart-count-changed', Object.keys(cart).length );
    };

    this.getCart = function() {
      return cart;
    };

    this.removeCart = function( dep_path ) {
      delete cart[ dep_path ];
    };

    this.inCart = function( dep_path ) {
      if ( cart[ dep_path ] ) {
        return true
      }

      return false;
    };

    this.clearCart = function() {
      cart = {};
      $rootScope.$emit('cart-count-changed', Object.keys(cart).length );
    };


  }]);

  app.service('RepoService', ['$rootScope','$http', function($rootScope,$http) {

      var rootUrl = 'https://lit.luvit.io/packages';
      var repo = {};
      var package_arr = [];

      var loaded = false;

      this.addToPackages = function( repo_obj ) {

        var packages  = repo_obj.packages;
        var pack_cnt  = repo_obj.package_cnt;
        var author    = repo_obj.author;

        angular.forEach( packages, function( link, pack_name ) {
          //console.log( packages );
          package_arr.push( { pack_name: pack_name, author: author, link: link } );
        });

      };

      this.loadRepo = function() {
        //var repo = this.repo;
        var add = this.addToPackages;

        //authors package list
        $http.get( rootUrl ).then( function( result ) {
          var call_cnt = Object.keys(result.data).length;
          // console.log( call_cnt );

          angular.forEach( result.data, function( link, author ) {
            //repo[author] = { author: author }
            repo[author] = { author: author, link: link }
          });

          angular.forEach( repo, function( repo_obj ) {
            var author = repo_obj.author;
            $http.get( repo_obj.link ).then( function( result ) {

              angular.forEach( result.data, function( link, pack_name ) {
                repo[ author ].packages = result.data;
                repo[ author ].package_cnt = Object.keys(result.data).length;
              });

              add( repo[ author ] );

              call_cnt = call_cnt - 1;
              if ( call_cnt <= 0 ) {
                loaded = true;
                $rootScope.$emit( 'packages-loaded', package_arr );
              };

            }, function( err ) {
              console.log( err );
            });
          });
        }, function( err ) {
          console.log( err );
        });
      };

      this.getPackageArr = function() {
        return package_arr;
      };

      this.getRepo = function() {
        return repo;
      };

      this.version = function() {
        return '0.0.1';
      };
  }]);

})();
