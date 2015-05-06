(function() {

  var app = angular.module('app', 
  [
    'ngRoute',
    'angularModalService',
    'Controllers',
    'Services'
  ]);

  app.config( function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: './html/home.html',
      controller: 'MainController'
    })
  });

  app.controller('RootController', ['$rootScope','$scope','Cart','ModalService', function($rootScope,$scope,Cart,ModalService) {
    $scope.pack_count = 0;

    $scope.showAModal = function() {
      var cart = Cart.getCart();
      ModalService.showModal({
        templateUrl: './html/modal.html',
        controller: 'ModalController',
        inputs: {
          pack_cart: cart
        }
       })
      .then( function( modal ) {
        modal.element.modal();
        modal.close.then( function( result ) {
          //console.log( result );
        });
      });
    };

    $scope.showCart = function() {
      console.log( Cart.getCart() );

    };

    $rootScope.$on('cart-count-changed', function( evt, count ) {
      $scope.pack_count = count;
      if (count == 0 ) {
        $(":checkbox").each( function() {
          this.checked = false;
        });
      };
    });
  }]);

  app.run( function($rootScope) {
    $rootScope.head_title = "Lit";
  });

})();