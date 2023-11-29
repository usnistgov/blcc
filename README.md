# BLCC
BLCC conducts economic analyses by evaluating the relative cost-effectiveness of alternative buildings and building-related systems or components.

The backend is written in [Rust](https://www.rust-lang.org) with the [Actix](https://actix.rs) framework and the 
frontend is created with [React](https://react.dev) and extensive usage of [RXJS](https://rxjs.dev).

## Frontend Development
```shell
# Download repository
git clone https://github.com/usnistgov/blcc
cd blcc/frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Build Backend
```shell
# Build backend for the dev target
cargo build

# Build as a release standalone binary
cargo build --release --target x86_64-unknown-linux-musl
```

## Docker
The dockerfile creates a container with the backend and frontend bundled inside.
```shell
# Build container
docker build -t blcc .

# Run container with docker command or a manager
```
