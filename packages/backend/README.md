# setup
## before diesel
1. create pdf user who has createdb permission.
1. add extention which create uuid.
```
postgres=# CREATE EXTENSION "uuid-ossp";
```

## diesel
```
$ cargo install diesel_cli --no-default-features --features postgres
$ diesel setup
$ diesel migration generate create_comic
$ diesel migration generate folder
```

## build for raspberry pi
```
docker run -itd -v "$PWD":/usr/src/myapp -w /usr/src/myapp arm32v7/rust:1.43.1-stretch bash
docker exec -it ${containerId} bash
rustup default nightly && cargo build --release
```