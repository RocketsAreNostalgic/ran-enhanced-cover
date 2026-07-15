# WordPress.org SVN hand-off

Do not commit this repository's development files directly to the plugin
directory SVN repository. First build and validate the allowlisted archive:

```sh
pnpm build
pnpm check:build
pnpm pot
pnpm release
pnpm release:verify
```

After the final directory slug, contributor accounts, trademark review, and
legal approval are confirmed, use a clean SVN checkout:

```sh
svn checkout https://plugins.svn.wordpress.org/ran-enhanced-cover/ ran-enhanced-cover-svn
unzip -q dist/ran-enhanced-cover-1.0.0.zip -d /tmp/ran-enhanced-cover-release
rsync -a --delete /tmp/ran-enhanced-cover-release/ran-enhanced-cover/ ran-enhanced-cover-svn/trunk/
svn -q add --force ran-enhanced-cover-svn/trunk
svn status ran-enhanced-cover-svn
svn commit ran-enhanced-cover-svn -m "Release 1.0.0"
svn copy https://plugins.svn.wordpress.org/ran-enhanced-cover/trunk \
	https://plugins.svn.wordpress.org/ran-enhanced-cover/tags/1.0.0 \
	-m "Tag 1.0.0"
```

The public directory artwork lives outside the release ZIP. Review the staged
icons and banners in `wordpress-org/assets/`, then upload only the
licence-cleared final files to the directory's `/assets/` SVN path. Do not copy
them into the plugin release ZIP.
