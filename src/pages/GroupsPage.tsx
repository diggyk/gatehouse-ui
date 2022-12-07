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
  groups: Map<string, proto.groups.Group>;
  setGroups: Function;
};

export default function GroupsPage() {
  const { client } = useAppContext();
  const [loading, setLoading]: [boolean, Function] = useState(true);
  const [errorMsg, setErrorMsg]: [string | null, any] = useState(null);
  const [statusMsg, setStatusMsg]: [string | null, any] = useState(null);

  const [groups, setGroups] = useState(new Map<string, proto.groups.Group>());

  // load data from API on first render
  useEffect(() => {
    let request = new proto.groups.GetGroupsRequest();
    let grp_map = new Map<string, proto.groups.Group>();

    client
      .getGroups(request, null)
      .then((response) => {
        response.getGroupsList().forEach((group: proto.groups.Group) => {
          grp_map.set(group.getName(), group);
        });
        setGroups(grp_map);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
      });
  }, []);

  /// Prints the nav
  const groupNav = () => {
    let group_items: JSX.Element[] = [];
    [...groups.values()]
      .sort((a, b) => String(a.getName()).localeCompare(b.getName()))
      .forEach((val, _) => {
        let name = val.getName();
        group_items.push(
          <Link key={name} className="item" to={"view/" + name}>
            <li key={name}>{name}</li>
          </Link>
        );
      });

    return (
      <Container>
        <Container className="header" key={"header"}>
          <span>Groups</span>
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
          <ul>{group_items}</ul>
        </Container>
      </Container>
    );
  };

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {groupNav()}
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
        {!loading && (
          <Outlet
            context={{ client, groups, setErrorMsg, setStatusMsg, setGroups }}
          />
        )}
      </Col>
    </Row>
  );
}

export function usePageContext() {
  return useOutletContext<ContextType>();
}
