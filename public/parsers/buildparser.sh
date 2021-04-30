#!/bin/sh

cd $(dirname $0)

pegjs -e geometricalShapesParser \
    --format globals \
    geometrical-shapes-parser.pegjs

pegjs -o geometrical-shapes-expression-parser.js \
    -e geometricalShapesExpressionParser \
    --format globals \
    --allowed-start-rules Expression \
    geometrical-shapes-parser.pegjs
