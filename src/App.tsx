import "./App.scss";
import logo from "./logo1.png";
import { Container, Nav, Navbar, NavbarBrand } from "react-bootstrap";

import { Link as NavLink, Route, Routes, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import PolicyRulesPage from "./pages/PolicyRulesPage";
import TargetsPage from "./pages/TargetsPage";
import EntitiesPage from "./pages/EntitiesPage";
import Entity from "./pages/Entity";
import Page404 from "./pages/Page404";
import Target from "./pages/Target";
import PolicyRule from "./pages/PolicyRule";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="policyrules" element={<PolicyRulesPage />}>
          <Route path=":name" element={<PolicyRule />} />
        </Route>
        <Route path="targets" element={<TargetsPage />}>
          <Route path=":typestr/:name" element={<Target />} />
        </Route>
        <Route path="entities" element={<EntitiesPage />}>
          <Route path=":typestr/:name" element={<Entity />} />
        </Route>
        <Route path="*" element={<Page404 />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <Container fluid className="h-100 p-0">
      <Navbar bg="dark" expand="lg" variant="dark" className="navbar">
        <NavbarBrand>
          <Nav.Link as={NavLink} to="/" eventKey="/">
            <img
              className="d-inline-block align-top"
              height="30"
              src={logo}
              alt="Logo"
            />{" "}
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
