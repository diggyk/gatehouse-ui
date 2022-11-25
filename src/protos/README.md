Generated using the protobuf definitions from the Gatehouse repo using:

```
protoc --js_out=import_style=commonjs,binary:. -I ~/gatehouse/proto ~/gatehouse/proto/*
```

To install the proper protobuf compilers on MacOS:
```
brew install protobuf@3
brew link --overwrite protobuf@3
```