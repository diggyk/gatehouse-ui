import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Alert, CloseButton, Col, Container, Row } from "react-bootstrap";
import { useOutletContext } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { useAppContext } from "../App";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  client: GatehousePromiseClient;
  setErrorMsg: Function;
  setStatusMsg: Function;
  roles: Map<string, proto.roles.Role>;
  setRoles: Function;
};

export default function RolesPage() {
  const { client } = useAppContext();
  const [errorMsg, setErrorMsg]: [string | null, any] = useState(null);
  const [statusMsg, setStatusMsg]: [string | null, any] = useState(null);

  const [roles, setRoles] = useState(new Map<string, proto.roles.Role>());

  // load data from API on first render
  useEffect(() => {
    let request = new proto.roles.GetRolesRequest();

    client
      .getRoles(request, null)
      .then((response) => {
        let roles = new Map<string, proto.roles.Role>();
        response.getRolesList().forEach((role: proto.roles.Role) => {
          roles.set(role.getName(), role);
        });

        setRoles(roles);
      })
      .catch((err) => {
        setErrorMsg(err.message);
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
          <Link key={name} className="item" to={"view/" + name}>
            <li key={name}>{name}</li>
          </Link>
        );
      });

    return (
      <Container>
        <Container className="header" key={"header"}>
          <span>Roles</span>
          <span style={{ float: "right" }}>
            <Link key="addbutton" to="add">
              <FontAwesomeIcon
                icon={faSquarePlus}
                className="plusButton"
                inverse
              />
            </Link>
          </span>
        </Container>
        <Container className="itemList">
          <ul>{role_items}</ul>
        </Container>
      </Container>
    );
  };

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav p-0">
        {rolesNav()}
      </Col>
      <Col className="mainContent">
        <Alert variant="danger" show={errorMsg !== null}>
          {errorMsg}
          <CloseButton
            style={{ float: "right" }}
            onClick={() => setErrorMsg(null)}
          />
        </Alert>
        <Alert variant="success" show={statusMsg !== null}>
          {statusMsg}
          <CloseButton
            style={{ float: "right" }}
            onClick={() => setStatusMsg(null)}
          />
        </Alert>
        <Outlet
          context={{ client, roles, setErrorMsg, setStatusMsg, setRoles }}
        />
      </Col>
    </Row>
  );
}

export function usePageContext() {
  return useOutletContext<ContextType>();
}
