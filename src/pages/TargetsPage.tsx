import React from "react";
import { Container } from "react-bootstrap";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

class TargetsPage extends React.Component<
  {},
  { targets: Array<proto.targets.Target> }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      targets: [],
    };
  }

  componentDidMount(): void {
    let request = new proto.targets.GetAllTargetsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let result = gatehouseSvc
      .getTargets(request, null)
      .then((response) => {
        this.setState({ targets: response.getTargetsList() });
      })
      .catch((err) => {
        console.error("ERROR:");
        console.error(err);
      });
  }

  render() {
    const targets = this.state.targets;
    return (
      <Container fluid className="h-100">
        {targets.map((target: proto.targets.Target) => (
          <div key={target.getName()}>{target.getName()}</div>
        ))}
      </Container>
    );
  }
}

export default TargetsPage;
