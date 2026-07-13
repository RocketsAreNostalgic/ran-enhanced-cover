# WordPress integration tests

The PHP tests use the official WordPress PHPUnit library rather than a mocked
renderer. Install a matching WordPress test environment, then point
`WP_TESTS_DIR` at its test library:

```sh
export WP_TESTS_DIR=/tmp/wordpress-tests-lib
composer install
composer test
```

The test library must contain `includes/functions.php` and a WordPress test
database configured by the standard WordPress test bootstrap. The GitHub
Actions workflow provisions the database and test library for WordPress 6.5 on
PHP 8.0 and the current WordPress release on the current supported PHP.
