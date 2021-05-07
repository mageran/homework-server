#!/bin/sh

cd $(dirname $0)

pegjs -e chemicalFormulaParser --format globals chemical-formula-grammar.pegjs