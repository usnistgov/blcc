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
## Disclaimers
This software was developed by employees of the National Institute of Standards and Technology (NIST), an agency of the Federal Government and is being made available AS-IS, works of NIST employees are not subject to copyright protection in the United States. This software may be subject to foreign copyright. Permission in the United States and in foreign countries, to the extent that NIST may hold copyright, to use, copy, modify, create derivative works, and distribute this software and its documentation without fee is hereby granted on a non-exclusive basis, provided that this notice and disclaimer of warranty appears in all copies. The software is provided 'as is' without any warranty of any kind, either expressed, implied, or statutory, including, but not limited to, any warranty that the software will conform to specifications, any implied warranties of merchantability, fitness for a particular purpose, and freedom from infringement, and any warranty that the documentation will conform to the software, or any warranty that the software will be error free. In no event shall NIST be liable for any damages, including, but not limited to, direct, indirect, special or consequential damages, arising out of, resulting from, or in any way connected with this software, whether or not based upon warranty, contract, tort, or otherwise, whether or not injury was sustained by persons or property or otherwise, and whether or not loss was sustained from, or arose out of the results of, or use of, the software or services provided hereunder.

Certain equipment, instruments, software, or materials are identified in order to specify the experimental procedure adequately. Such identification is not intended to imply recommendation or endorsement of any product or service by NIST, nor is it intended to imply that the materials or equipment identified are necessarily the best available for the purpose.
