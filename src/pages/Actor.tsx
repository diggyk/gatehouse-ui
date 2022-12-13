import { useState } from "react";
import { Button, Card, Container, Modal, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import AttributeViewer from "../elements/AttributeViewer";
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

  const actor = actors.get(typestr)?.get(name);

  if (!actor) {
    return (
      <Card>
        <Card.Body>ERROR: Actor not found in context</Card.Body>
      </Card>
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
          <Card.Title>{actor.getName()}</Card.Title>
          <Card.Subtitle>{actor.getTypestr()}</Card.Subtitle>
          <SectionHeader>Attributes</SectionHeader>
          <SectionItem>
            <AttributeViewer attribs={actor.getAttributesMap()} />
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
