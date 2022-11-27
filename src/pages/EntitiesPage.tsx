import React from "react";
import { Col, Container, Nav, NavLink, Row } from "react-bootstrap";
import { useParams } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

class EntitiesPage extends React.Component<
  {},
  { entities: Map<string, Array<proto.entities.Entity>> }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      entities: new Map<string, Array<proto.entities.Entity>>(),
    };
  }

  componentDidMount(): void {
    let request = new proto.entities.GetAllEntitiesRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let ent_map = new Map<string, Array<proto.entities.Entity>>();
    let result = gatehouseSvc
      .getEntities(request, null)
      .then((response) => {
        let entities = response.getEntitiesList();
        entities.forEach((entity: proto.entities.Entity) => {
          let typestr = entity.getTypestr();
          if (!ent_map.has(typestr)) {
            ent_map.set(typestr, []);
          }
          let typed_entities = ent_map.get(typestr);
          if (typed_entities !== undefined) {
            typed_entities.push(entity);
          }
        });
        this.setState({ entities: ent_map });
      })
      .catch((err) => {
        console.error("ERROR:");
        console.error(err);
      });
  }

  /// Prints the nav for keys, organized by types
  entityNav = () => {
    let type_sections: JSX.Element[] = [];
    const typed_entities = new Map(
      [...this.state.entities.entries()].sort(([a], [b]) =>
        String(a).localeCompare(b)
      )
    );
    typed_entities.forEach((vals, key) => {
      let entity_items: JSX.Element[] = [];
      vals.forEach((val) => {
        let uid = val.getTypestr() + "@" + val.getName();
        entity_items.push(
          <Link key={uid} className="item" to={uid}>
            {val.getName()}
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
          {entity_items}
        </Container>
      );
      type_sections.push(item);
    });
    return <Container>{type_sections}</Container>;
  };

  render() {
    const entities = this.state.entities;
    return (
      <Row className="h-100">
        <Col lg="2" className="sidePickerNav h-100 p-0">
          {this.entityNav()}
        </Col>
        <Col>
          <Outlet />
        </Col>
      </Row>
    );
  }
}

export default EntitiesPage;
