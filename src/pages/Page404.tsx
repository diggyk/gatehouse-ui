import { Col, Row } from "react-bootstrap";
import logo from "../logo1.png";

export default function Page404() {
  return (
    <Row fluid className="h-100">
      <Col className="mainContent h-100" style={{ textAlign: "center" }}>
        <img src={logo} height="400px" alt="logo" />
        <p>Page not found</p>
      </Col>
    </Row>
  );
}
