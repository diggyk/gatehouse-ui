import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

export default function PolicyRulesPage() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    let request = new proto.policies.GetPoliciesRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let result = gatehouseSvc
      .getPolicies(request, null)
      .then((response) => {
        setRules(response.getRulesList());
      })
      .catch((err) => {
        console.error("ERROR:");
        console.error(err);
      });
  }, []);

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {rules.map((rule: proto.policies.PolicyRule) => (
          <div key={rule.getName()}>{rule.getName()}</div>
        ))}
      </Col>
      <Col className="mainContent">
        <Outlet context={{ rules }} />
      </Col>
    </Row>
  );
}
