#!/bin/bash
set -e
git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"
git submodule sync
git submodule update --init --recursive
