#!/bin/sh
# Run before committing: gives every css/js link a fresh ?v= so CDN caches can't serve stale files.
v=$(date +%s)
sed -i.bak -E "s#((href|src)=\")((css|js)/[^\"?]*)(\?v=[0-9]+)?\"#\1\3?v=$v\"#g" index.html && rm index.html.bak