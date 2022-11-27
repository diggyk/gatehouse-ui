import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

export default function TargetsPage() {
  const [targets, setTargets] = useState([]);

  useEffect(() => {
    let request = new proto.targets.GetAllTargetsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let result = gatehouseSvc
      .getTargets(request, null)
      .then((response) => {
        setTargets(response.getTargetsList());
      })
      .catch((err) => {
        console.error("ERROR:");
        console.error(err);
      });
  }, []);

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {targets.map((target: proto.targets.Target) => (
          <div key={target.getName()}>{target.getName()}</div>
        ))}
      </Col>
      <Col className="mainContent">
        <Outlet context={{ targets }} />
      </Col>
    </Row>
  );
}
