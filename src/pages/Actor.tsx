import { useState } from "react";
import { Button, Card, Container, Modal, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { usePageContext } from "./ActorsPage";

export default function Actor() {
  const navigate = useNavigate();
  const { actors, setActors, client, setErrorMsg, setStatusMsg } =
    usePageContext();
  const { typestr, name } = useParams();

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = (typestr: string, name: string) => {
    let req = new proto.actors.RemoveActorRequest()
      .setName(name)
      .setTypestr(typestr);

    client
      .removeActor(req, null)
      .then((response: proto.actors.ActorResponse) => {
        setStatusMsg("Actor " + typestr + ":" + name + " deleted!");

        actors.get(typestr)?.delete(name);
        setActors(new Map(actors));
        navigate("/actors");
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  if (!typestr || !name) {
    return <Container>Error -- type or name not set</Container>;
  }

  const entity = actors.get(typestr)?.get(name);

  if (!entity) {
    return (
      <Card>
        <Card.Body>ERROR: Actor not found in context</Card.Body>
      </Card>
    );
  }

  let attributes = entity.getAttributesMap();

  let headers: JSX.Element[] = [];
  if (attributes.getLength() > 0) {
    headers.push(
      <tr className="subheading" key="subheading">
        <th>Key</th>
        <th>Value(s)</th>
      </tr>
    );
  }

  let attrs: JSX.Element[] = [];
  if (attributes.getLength() > 0) {
    attributes.forEach((val: proto.common.AttributeValues, key: string) => {
      attrs.push(
        <tr key={key + "attr"}>
          <td>{key}</td>
          <td>{val.getValuesList().sort().join(", ")}</td>
        </tr>
      );
    });
  } else {
    attrs.push(
      <tr key="emptyattributes">
        <td colSpan={2}>No attributes</td>
      </tr>
    );
  }

  return (
    <>
      <Modal show={deleteConfirm} onHide={() => setDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deleting cannot be undone. Are you sure you want to delete?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleDelete(typestr, name)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{entity.getName()}</Card.Title>
          <Card.Subtitle>{entity.getTypestr()}</Card.Subtitle>
          <SectionHeader>Attributes</SectionHeader>
          <SectionItem>
            <Table className="showEntryTable">
              <thead>{headers}</thead>
              <tbody>{attrs}</tbody>
            </Table>
          </SectionItem>
          <Card.Footer>
            <Link to={"../edit/" + typestr + "/" + name}>
              <Button>Edit</Button>
            </Link>
            <Button
              style={{ float: "right" }}
              variant="secondary"
              onClick={(_) => setDeleteConfirm(true)}
            >
              Delete
            </Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </>
  );
}
