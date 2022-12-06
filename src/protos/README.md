Generated using the protobuf definitions from the Gatehouse repo using:

```
protoc --js_out=import_style=commonjs,binary:. --grpc-web_out=import_style=commonjs,mode=grpcweb:. -I ~/gatehouse/proto ~/gatehouse/proto/*
```

To install the proper protobuf compilers on MacOS:
```
brew install protobuf@3
brew link --overwrite protobuf@3
```
