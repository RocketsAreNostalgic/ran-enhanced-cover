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
`composer check` runs syntax, standards, `test:quality` and analysis.

## Coverage and remaining acceptance

PHPCS/PHPCBF share the same configuration and source/template/test roots. Runtime
metadata and generated copies retain syntax/generated checks; maintained scripts
now also use PHPCS/PHPCBF with narrow standalone CLI exceptions. The Blocks.php
filename exception preserves the established autoload/metadata identity.
There is no PHP-CS-Fixer dependency or parallel PHP formatter to remove.

PHPUnit requires WordPress/database and remains `test:integration`; generated
block/POT checks, deterministic archive verification, fresh ZIP installation and
Plugin Check remain required in native CI. Syntax discovery/failure controls,
formatter evidence and final CI/review/merge acceptance remain tracked in #30.

## Final standards and syntax scope

The syntax runner now includes generated runtime PHP and rejects empty selection.
Ordinary `test:quality` uses actual-parser fixtures for malformed source in runtime,
source/generated blocks, scripts and tests, safe filenames, dependency pruning,
partial discovery failure and PHP process failures. Config-driven standards tests
prove all authored PHP roots reject formatting defects and that fixes are stable.
The checks use explicit exceptions rather than Python's removable assertions and
remain active under Python optimization. Python 3 is an ordinary-test prerequisite.

The native Quality job checks PHP entries in the finished release ZIP against
direct PHPStan roots. A disposable ZIP with an uncovered root PHP file proves
that later packaging changes fail until analysis is updated. Imported or
excluded PHPStan paths require review. This leaves the level-4 floor, archive
bytes and installed behavior unchanged.

The blanket scripts exclusion is removed. Packaging exception messages target a
terminal, not HTML; native local filesystem operations run without WordPress.
Only these concrete host assumptions are exempted in the relevant CLI files.
PHPCBF's alignment changes preserve executable tokens. Existing WordPress/database,
generated build/POT, reproducible archive/install and Plugin Check gates remain
required. Native final-head/main and review evidence is recorded in #30.

Maintained `tests/wp-tests-config.php.template` is explicitly included in syntax
and PHP-tokenized PHPCS/PHPCBF selection. Actual-command regressions introduce
malformed PHP and formatting defects in this template, and snapshot repeatability
includes its bytes. Its `$table_prefix` assignment has one narrow exception because
WordPress requires that configuration global; other template checks remain active.
