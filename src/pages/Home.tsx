import { Col, Row } from "react-bootstrap";
import logo from "../logo1.png";

export default function Home() {
  return (
    <Row className="h-100">
      <Col className="mainContent h-100" style={{ textAlign: "center" }}>
        <img src={logo} height="400px" alt="logo" />
      </Col>
    </Row>
  );
}
