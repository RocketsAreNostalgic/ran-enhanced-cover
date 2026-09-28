# PHP quality acceptance

Issue #30 owns the residual quality work after the completed release migration.
The support floor remains WordPress 6.5 / PHP 8.0. No interactive block/editor
behavior is changed or claimed verified by this analysis slice.

## Analysis

`composer analyze` is an initial blocking PHPStan level 4 gate, targeting PHP 8.0
with a 512 MB limit. Direct roots cover all PHP in the plugin entrypoint,
includes, source/generated block templates and metadata, and maintained scripts.
Locked WordPress 6.5.7 stubs supply symbols only; bootstrap constants model
runtime-derived paths without executing plugin hooks. Render-file PHPDoc declares
the attributes and inner content supplied by WordPress. Source/generated copies
remain identical and executable behavior is unchanged. There is no error baseline
or ignored diagnostic; existing locked package records are retained.

The level-5 probe identifies four numeric-to-esc_attr calls in each render copy.
They currently rely on WordPress's scalar string conversion. Resolving this typing
boundary and any level increase require separately reviewed behavior evidence;
this initial level-4 gate is not represented as level 5 or UI acceptance.
`composer check` now runs syntax, standards and analysis.

## Coverage and remaining acceptance

PHPCS/PHPCBF share the same configuration and source/template/test roots. Runtime
metadata and generated copies retain syntax/generated checks; standalone scripts
retain syntax and analysis with a documented PHPCS exclusion. The Blocks.php
filename exception preserves the established autoload/metadata identity.
There is no PHP-CS-Fixer dependency or parallel PHP formatter to remove.

PHPUnit requires WordPress/database and remains `test:integration`; generated
block/POT checks, deterministic archive verification, fresh ZIP installation and
Plugin Check remain required in native CI. Syntax discovery/failure controls,
formatter evidence and final CI/review/merge acceptance remain tracked in #30.
