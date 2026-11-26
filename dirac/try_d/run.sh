#!/bin/bash
# usage: try_d/run.sh kind mode start dur times   (runs in try_d/<mode>, copies sheet to try_d/<mode>.jpg, prints luma)
cd /c/Users/daggu222105/VIDEO-TOOL/dirac
k=$1; m=$2
../.venv/Scripts/python.exe -I tools/try.py try_d/$m $k $m $3 $4 $5 | tail -1
cp try_d/$m/sheet.jpg try_d/$m.jpg
cp try_d/luma.py try_d/$m/luma.py; ../.venv/Scripts/python.exe -I try_d/$m/luma.py
