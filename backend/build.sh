#!/bin/bash
cargo build
mv target/debug/backend .
./backend
