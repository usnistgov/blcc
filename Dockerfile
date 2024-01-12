FROM node AS frontend-builder

WORKDIR /app
RUN npm install -g pnpm

COPY ./frontend/package.json /app
COPY ./frontend/e3-sdk-1.0.10.tgz /app
RUN pnpm install

COPY ./frontend/ /app
RUN pnpm run build

FROM clux/muslrust:1.75.0 AS backend-builder

WORKDIR /app
COPY ./backend /app
ENV TARGET x86_64-unknown-linux-musl

RUN rustup target add "$TARGET"
RUN cargo build --release --locked --target "$TARGET"

FROM scratch

COPY --from=backend-builder /app/target/x86_64-unknown-linux-musl/release/backend /server
COPY --from=frontend-builder /app/dist /public/dist

EXPOSE 8080
CMD ["./server"]