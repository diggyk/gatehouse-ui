import React, { Component } from "react";
import "./App.scss";
import * as grpcWeb from "grpc-web";
import {
  GatehouseClient,
  GatehousePromiseClient,
} from "./protos/gatehouse_grpc_web_pb";
import logo from "./logo1.png";
import { Col, Container, Nav, Navbar, NavbarBrand, Row } from "react-bootstrap";

import { Link as NavLink, Route, Routes, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import PolicyRulesPage from "./pages/PolicyRulesPage";
import TargetsPage from "./pages/TargetsPage";
import EntitiesPage from "./pages/EntitiesPage";

class App extends React.Component<
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
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="policyrules" element={<PolicyRulesPage />} />
          <Route path="targets" element={<TargetsPage />} />
          <Route path="entities" element={<EntitiesPage />} />
          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          {/* <Route path="*" element={<NoMatch />} /> */}
        </Route>
      </Routes>
    );
  }
}

function Layout() {
  return (
    <Container fluid className="h-100 p-0">
      <Navbar bg="dark" expand="lg" variant="dark" className="navbar">
        <NavbarBrand>
          <Nav.Link as={NavLink} to="/" eventKey="/">
            <img className="d-inline-block align-top" height="30" src={logo} />{" "}
            Gatehouse
          </Nav.Link>
        </NavbarBrand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/policyrules" eventKey="/policyrules">
              Policy Rules
            </Nav.Link>
            <Nav.Link as={NavLink} to="/targets" eventKey="/targets">
              Targets
            </Nav.Link>
            <Nav.Link as={NavLink} to="/entities" eventKey="/entities">
              Entities
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container fluid className="mainBody">
        <Outlet />
      </Container>
    </Container>
  );
}

export default App;
