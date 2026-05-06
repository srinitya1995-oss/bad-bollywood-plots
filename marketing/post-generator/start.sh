#!/usr/bin/env bash
# Bad Desi Plots — Local renderer server
# Why: Babel-standalone fetches JSX files via XHR, which file:// blocks.
# This serves the post-generator folder over http://localhost:8080.

set -e

PORT="${1:-8080}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  ▶ Bad Desi Plots — post generator"
echo "  ▶ serving: $DIR"
echo "  ▶ port:    $PORT"
echo ""
echo "  open in browser:"
echo "    http://localhost:$PORT"
echo ""
echo "  individual posts:"
echo "    http://localhost:$PORT/posts/01-tue-A-DDLJ.html"
echo "    http://localhost:$PORT/posts/02-wed-A-RRR.html"
echo "    http://localhost:$PORT/posts/03-thu-B-carousel.html"
echo "    http://localhost:$PORT/posts/04-fri-E-quote.html"
echo "    http://localhost:$PORT/posts/05-sat-C-DDLJ-reveal.html"
echo ""
echo "  ctrl-c to stop"
echo ""

cd "$DIR"
python3 -m http.server "$PORT"
