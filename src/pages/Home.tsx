import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import logo from "../logo1.png";

export default function Home() {
  return (
    <Row fluid className="h-100">
      <Col className="mainContent h-100" style={{ textAlign: "center" }}>
        <img src={logo} height="400px" />
      </Col>
    </Row>
  );
}
