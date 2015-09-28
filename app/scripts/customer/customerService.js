(function() {
  'use-strict';

  var mysql      = require('mysql'),
      connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'customer_manager'
      });

  angular.module('app')

  .service('customerService', ['$q', CustomerService]);

  function CustomerService($q) {

    var deferred = $q.defer();

    // return service functions that communicate with the database
    return {
      getCustomers: getCustomers,
      getById: getById,
      getByName: getCustomerByName,
      create: createCustomer,
      destroy: deleteCustomer,
      update: updateCustomer
    };

    function getCustomers() {
      var query = 'SELECT * FROM customers';

      connection.query(query, function(err, rows) {
        if (err) deferred.reject(err)

        deferred.resolve(rows);
      });

      return deferred.promise;
    }

    function getCustomerById() {
      var query = 'SELECT * FROM customers WHERE customer_id = ?';

      connection.query(query, [id], function(err, rows) {
        if (err) deferred.reject(err);

        deferred.resolve(rows);
      });

      return deferred.promise;
    }

    function getCustomerByName(name) {
      var query = "SELECT * FROM customers WHERE name LIKE '" + name + "%'";

      connection.query(query, [name], function(err, rows) {
        if (err) deferred.reject(err);

        deferred.resolve(rows);
      });

      return deferred.promise;
    }

    function createCustomer(customer) {
      var query = 'INSERT INTO customers SET ?';

      connection.query(query, customer, function(err, res) {
        if (err) deferred.reject(err);

        deferred.resolve(res.insertId);
      });

      return deferred.promise;
    }

    function deleteCustomer(id) {
      var query = 'DELETE FROM customers WHERE customer_id = ?';

      connection.query(query, [id], function(err, res) {
        if (err) deferred.reject(err);

        deferred.resolve(res.affectedRows);
      });

      return deferred.promise;
    }

    function updateCustomer(customer) {
      var query = 'UPDATE customers SET name = ? WHERE customer_id = ?';

      connection.query(query, [customer.name, customer.customer_id], function(err, res) {
        if (err) deferred.reject(err);

        deferred.resolve(res);
      });

      return deferred.promise;
    }
  }
})();
