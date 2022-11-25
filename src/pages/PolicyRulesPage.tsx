import React from "react";
import { Container } from "react-bootstrap";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

class PolicyRulesPage extends React.Component<
  {},
  { rules: Array<proto.policies.PolicyRule> }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      rules: [],
    };
  }

  componentDidMount(): void {
    let request = new proto.policies.GetPoliciesRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let result = gatehouseSvc
      .getPolicies(request, null)
      .then((response) => {
        this.setState({ rules: response.getRulesList() });
      })
      .catch((err) => {
        console.error("ERROR:");
        console.error(err);
      });
  }

  render() {
    const rules = this.state.rules;
    return (
      <Container fluid>
        {rules.map((rule: proto.policies.PolicyRule) => (
          <div key={rule.getName()}>{rule.getName()}</div>
        ))}
      </Container>
    );
  }
}

export default PolicyRulesPage;
