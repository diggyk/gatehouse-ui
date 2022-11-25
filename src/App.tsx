import React, { Component } from 'react';
import "./App.scss";
import * as grpcWeb from 'grpc-web';
import {GatehouseClient, GatehousePromiseClient} from './protos/gatehouse_grpc_web_pb';
import logo from './logo1.png'
import { Col, Container, Nav, Navbar, NavbarBrand, Row } from 'react-bootstrap';

class App extends React.Component<{}, {rules: Array<proto.policies.PolicyRule>}> {
  constructor(props: any) {
    super(props);
    this.state = {
      rules: []
    }
  }

  componentDidMount(): void {
    let request = new proto.policies.GetPoliciesRequest();
    let gatehouseSvc = new GatehousePromiseClient("http://localhost:6174", null, null);
    let result = gatehouseSvc.getPolicies(request, null).then(response => {
      this.setState({ rules: response.getRulesList()});
    }).catch(err => { console.error("ERROR:"); 
    console.error(err)});
  }

  render() {
    const rules  = this.state.rules;
    return (
      <Container fluid className="bodyClass">
        <Navbar bg="dark" expand="lg" variant="dark" className='navbar'>
            <NavbarBrand><img className="d-inline-block align-top" height="30" src={logo} />{' '}Gatehouse</NavbarBrand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link>Policy Rules</Nav.Link>
              <Nav.Link>Targets</Nav.Link>
              <Nav.Link>Entities</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      <Container className="App" fluid>
        {
          rules.map(
            (rule:proto.policies.PolicyRule) => (
              <div key={rule.getName()}>
                {rule.getName()}
              </div>
            )
          )
        }
      </Container>
      </Container>
    );
  }
}

export default App;
