import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useOutletContext } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  groups: Map<string, proto.groups.Group>;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState(new Map<string, proto.groups.Group>());
  const [error, setError] = useState(null);

  // load data from API on first render
  useEffect(() => {
    let request = new proto.groups.GetGroupsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );

    let grp_map = new Map<string, proto.groups.Group>();

    gatehouseSvc
      .getGroups(request, null)
      .then((response) => {
        response.getGroupsList().forEach((group: proto.groups.Group) => {
          grp_map.set(group.getName(), group);
        });
        setGroups(grp_map);
      })
      .catch((err) => {
        setError(err.message);
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
          <Link key={name} className="item" to={name}>
            <li key={name}>{name}</li>
          </Link>
        );
      });

    return (
      <Container>
        <Container className="header" key={"header"}>
          Groups
        </Container>
        <Container className="itemList">
          <ul>{group_items}</ul>
        </Container>
      </Container>
    );
  };

  let mainContent;
  if (error == null) {
    mainContent = <Outlet context={{ groups }} />;
  } else {
    mainContent = <Container className="errorNote">{error}</Container>;
  }

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {groupNav()}
      </Col>
      <Col className="mainContent">{mainContent}</Col>
    </Row>
  );
}

export function useGroups() {
  return useOutletContext<ContextType>();
}
