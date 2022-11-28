import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Outlet, useOutletContext } from "react-router";
import { Link } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  rules: Map<string, proto.policies.PolicyRule>;
};

export default function PolicyRulesPage() {
  const [rules, setRules] = useState(
    new Map<string, proto.policies.PolicyRule>()
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    let request = new proto.policies.GetPoliciesRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    gatehouseSvc
      .getPolicies(request, null)
      .then((response) => {
        let rules_map = new Map<string, proto.policies.PolicyRule>();
        response.getRulesList().forEach((rule: proto.policies.PolicyRule) => {
          rules_map.set(rule.getName(), rule);
        });
        setRules(rules_map);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const rulesNav = () => {
    let rules_list: JSX.Element[] = [];

    [...rules.values()]
      .sort((a, b) => String(a.getName()).localeCompare(b.getName()))
      .forEach((rule) => {
        let name = rule.getName();
        rules_list.push(
          <Link key={name} className="item" to={name}>
            <li key={name}>{name}</li>
          </Link>
        );
      });
    return (
      <Container className="itemList" key={"rules_list"}>
        <ul>{rules_list}</ul>
      </Container>
    );
  };

  let mainContent;
  if (error == null) {
    mainContent = <Outlet context={{ rules }} />;
  } else {
    mainContent = <Container className="errorNote">{error}</Container>;
  }

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {rulesNav()}
      </Col>
      <Col className="mainContent">{mainContent}</Col>
    </Row>
  );
}

export function useRules() {
  return useOutletContext<ContextType>();
}
