import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useOutletContext } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  roles: Map<string, proto.roles.Role>;
};

export default function RolesPage() {
  const [roles, setRoles] = useState(new Map<string, proto.roles.Role>());
  const [error, setError] = useState(null);

  // load data from API on first render
  useEffect(() => {
    let request = new proto.roles.GetRolesRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );

    gatehouseSvc
      .getRoles(request, null)
      .then((response) => {
        let roles = new Map<string, proto.roles.Role>();
        response.getRolesList().forEach((role: proto.roles.Role) => {
          roles.set(role.getName(), role);
        });

        setRoles(roles);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  /// Prints the nav
  const rolesNav = () => {
    let role_items: JSX.Element[] = [];
    [...roles.values()]
      .sort((a, b) => String(a.getName()).localeCompare(b.getName()))
      .forEach((val, _) => {
        let name = val.getName();
        role_items.push(
          <Link key={name} className="item" to={name}>
            <li key={name}>{name}</li>
          </Link>
        );
      });

    return (
      <Container>
        <Container className="header" key={"header"}>
          Roles
        </Container>
        <Container className="itemList">
          <ul>{role_items}</ul>
        </Container>
      </Container>
    );
  };

  let mainContent;
  if (error == null) {
    mainContent = <Outlet context={{ roles }} />;
  } else {
    mainContent = <Container className="errorNote">{error}</Container>;
  }

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {rolesNav()}
      </Col>
      <Col className="mainContent">{mainContent}</Col>
    </Row>
  );
}

export function useRoles() {
  return useOutletContext<ContextType>();
}
