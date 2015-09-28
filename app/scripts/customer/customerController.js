(function() {
  'use-strict';

  angular.module('app')

  .controller('customerController', ['customerService', '$q', '$mDialog', CustomerController]);

  function CustomerController(customerService, $q, $mDialog) {
    var vm = this;

    vm.selected = null;
    vm.customers = [];
    vm.selectedIndex = 0;
    vm.filterText = null;
    vm.selectCustomer = selectCustomer;
    vm.deleteCustomer = deleteCustomer;
    vm.saveCustomer = saveCustomer;
    vm.createCustomer = createCustomer;
    vm.filter = filterCustomer;

    // get initial data by calling the getAllCustomers function
    getAllCustomers();

    function selectCustomer(customer, index) {
      vm.selected = angular.isNumber(customer) ? vm.customers[customer] : customer;
      vm.selectedIndex = angular.isNumber(customer) ? customer : index;
    }

    function deleteCustomer($event) {
      var confirm = $mDialog.confirm()
                            .title('Are you sure?')
                            .content('Are you sure you want to delete this customer?')
                            .ok('yes')
                            .cancel('No')
                            .targetEvent($event);

      $mDialog.show(confirm).then(function() {
        customerService.destroy(vm.selected.customer_id).then(function(affectedRows) {
          vm.customers.splice(vm.selectedIndex, 1);
        });
      }, function() {});
    }

    function saveCustomer($event) {
      if(vm.selected != null && vm.selected.customer_id != null) {
        customerService.update(vm.selected).then(function(affectedRows) {
          $mDialog.show(
            $mDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Success')
              .content('Data Updates Successfully')
              .ok('Ok')
              .targetEvent($event)
          );
        });
      }
      else {
        customerService.create(vm.selected).then(function(affectedRows) {
          $mDialog.show(
            $mDialog
              .alert()
              .clickOutsideToClose(true)
              .title('Success')
              .content('Data Added Successfully')
              .ok('Ok')
              .targetEvent($event)
          );
        });
      }
    }

    function createCustomer() {
      vm.selected = {};
      vm.selectedIndex = null;
    }

    function getAllCustomers() {
      customerService.getCustomers().then(function(customers) {
        vm.customers = [].concat(customers);
        vm.selected = customers[0];
      });
    }

    function filterCustomer() {
      if(vm.filterText == null || vm.filterText == '') {
        getAllCustomers();
      }
      else {
        customerService.getByName(vm.filterText).then(function(customers) {
          vm.customers = [].concat(customers);
          vm.selected = customers[0];
        });
      }
    }
  }
})();
