import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useOutletContext } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  actors: Map<string, Map<string, proto.actors.Actor>>;
};

export default function ActorsPage() {
  let nullMap = new Map<string, Map<string, proto.actors.Actor>>();
  const [actors, setActors] = useState(nullMap);
  const [error, setError] = useState(null);

  // load data from API on first render
  useEffect(() => {
    let request = new proto.actors.GetActorsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let ent_map = new Map<string, Map<string, proto.actors.Actor>>();
    gatehouseSvc
      .getActors(request, null)
      .then((response) => {
        let actors = response.getActorsList();
        actors.forEach((entity: proto.actors.Actor) => {
          let typestr = entity.getTypestr();
          if (!ent_map.has(typestr)) {
            ent_map.set(typestr, new Map<string, proto.actors.Actor>());
          }
          let typed_actors = ent_map.get(typestr);
          if (typed_actors !== undefined) {
            typed_actors.set(entity.getName(), entity);
          }
        });
        setActors(ent_map);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  /// Prints the nav for keys, organized by types
  const entityNav = () => {
    let type_sections: JSX.Element[] = [];
    const typed_actors = new Map(
      [...actors.entries()].sort(([a], [b]) => String(a).localeCompare(b))
    );
    typed_actors.forEach((vals, key) => {
      let entity_items: JSX.Element[] = [];
      [...vals.keys()].sort().forEach((val) => {
        let uid = key + "/" + val;
        entity_items.push(
          <Link key={uid} className="item" to={uid}>
            <li key={uid}>{val}</li>
          </Link>
        );
      });

      type_sections.push(
        <Container className="header" key={key + "_header"}>
          {key}
        </Container>
      );

      let item = (
        <Container className="itemList" key={key + "_list"}>
          <ul>{entity_items}</ul>
        </Container>
      );
      type_sections.push(item);
    });
    return <Container>{type_sections}</Container>;
  };

  let mainContent;
  if (error == null) {
    mainContent = <Outlet context={{ actors }} />;
  } else {
    mainContent = <Container className="errorNote">{error}</Container>;
  }

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav p-0">
        {entityNav()}
      </Col>
      <Col className="mainContent">{mainContent}</Col>
    </Row>
  );
}

export function useActors() {
  return useOutletContext<ContextType>();
}
