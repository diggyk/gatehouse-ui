import "./App.scss";
import logo from "./logo1.png";
import { Container, Nav, Navbar, NavbarBrand } from "react-bootstrap";

import {
  Link as NavLink,
  Route,
  Routes,
  Outlet,
  useOutletContext,
} from "react-router-dom";
import Home from "./pages/Home";
import PolicyRulesPage from "./pages/PolicyRulesPage";
import TargetsPage from "./pages/TargetsPage";
import ActorsPage from "./pages/ActorsPage";
import Actor from "./pages/Actor";
import Page404 from "./pages/Page404";
import Target from "./pages/Target";
import PolicyRule from "./pages/PolicyRule";
import GroupsPage from "./pages/GroupsPage";
import Group from "./pages/Group";
import RolesPage from "./pages/RolesPage";
import Role from "./pages/Role";
import EditRole from "./pages/EditRole";
import AddRole from "./pages/AddRole";
import EditGroup from "./pages/EditGroup";
import { GatehousePromiseClient } from "./protos/gatehouse_grpc_web_pb";
import AddGroup from "./pages/AddGroup";
import EditActor from "./pages/EditActor";

type ContextType = {
  client: GatehousePromiseClient;
};

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
        <Route path="actors" element={<ActorsPage />}>
          <Route path="view/:typestr/:name" element={<Actor />} />
          <Route path="edit/:typestr/:name" element={<EditActor />} />
        </Route>
        <Route path="groups" element={<GroupsPage />}>
          <Route path="view/:name" element={<Group />} />
          <Route path="edit/:name" element={<EditGroup />} />
          <Route path="add" element={<AddGroup />} />
        </Route>
        <Route path="roles" element={<RolesPage />}>
          <Route path="view/:name" element={<Role />} />
          <Route path="edit/:name" element={<EditRole />} />
          <Route path="add" element={<AddRole />} />
        </Route>
        <Route path="*" element={<Page404 />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  const client = new GatehousePromiseClient(
    "http://localhost:6174",
    null,
    null
  );

  return (
    <Container fluid className="p-0">
      <Navbar bg="dark" expand="lg" variant="dark" className="navbar">
        <Nav className="me-auto">
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
            <Nav.Link as={NavLink} to="/policyrules" eventKey="/policyrules">
              Policy Rules
            </Nav.Link>
            <Nav.Link as={NavLink} to="/targets" eventKey="/targets">
              Targets
            </Nav.Link>
            <Nav.Link as={NavLink} to="/actors" eventKey="/actors">
              Actors
            </Nav.Link>
            <Nav.Link as={NavLink} to="/groups" eventKey="/groups">
              Groups
            </Nav.Link>
            <Nav.Link as={NavLink} to="/roles" eventKey="/roles">
              Roles
            </Nav.Link>
          </Navbar.Collapse>
        </Nav>
      </Navbar>
      <Container fluid className="mainBody">
        <Outlet context={{ client }} />
      </Container>
    </Container>
  );
}

export function useAppContext() {
  return useOutletContext<ContextType>();
}
