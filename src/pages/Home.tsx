import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import logo from "../logo1.png";

class Home extends React.Component {
  render() {
    return (
      <Row fluid className="h-100">
        <Col lg="2" className="sidePickerNav"></Col>
        <Col className="mainContent h-100">
          <img className="d-inline-block" src={logo} height="400px" />
        </Col>
      </Row>
    );
  }
}

export default Home;
