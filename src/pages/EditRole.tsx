import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";
import { useRoles } from "./RolesPage";

export default function EditRole() {
  const { roles } = useRoles();
  const { name } = useParams();
  const { register, handleSubmit } = useForm({ mode: "all" });
  const onError = (errors: any) => {};
  const [errorMsg, setErrorMsg]: [string | null, any] = useState(null);
  const [statusMsg, setStatusMsg]: [string | null, any] = useState(null);

  const [groups, setGroups]: [string[], any] = useState([]);
  const [addGranted, setAddGranted]: [string[], any] = useState([]);
  const [removeGranted, setRemoveGranted]: [string[], any] = useState([]);

  // update the role
  const handleUpdate = (data: any) => {
    console.log("Updating...");
    let req = new proto.roles.ModifyRoleRequest()
      .setAddGrantedToList(addGranted)
      .setRemoveGrantedToList(removeGranted)
      .setDesc(data.desc)
      .setName(name || "");

    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );

    gatehouseSvc
      .modifyRole(req, null)
      .then((response: proto.roles.RoleResponse) => {
        let updated_role = response.getRole();

        if (!updated_role) {
          setErrorMsg("No update role returned from server");
          return;
        }

        console.log("Updated!");
        setStatusMsg("Role updated!");
        roles.set(updated_role.getName(), updated_role);
        setAddGranted([]);
        setRemoveGranted([]);
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      });
  };

  /// load the group names
  useEffect(() => {
    let request = new proto.groups.GetGroupsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );

    gatehouseSvc
      .getGroups(request, null)
      .then((response: proto.groups.MultiGroupResponse) => {
        console.log("Loading groups...");
        let grp_names: string[] = [];
        response.getGroupsList().forEach((group: proto.groups.Group) => {
          grp_names.push(group.getName());
        });
        setGroups(grp_names);
        console.log("Loaded " + grp_names.length + " groups");
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      });
  }, []);

  if (!name) {
    return <Container>Error -- name not set</Container>;
  }

  const role = roles.get(name);

  if (!role) {
    return (
      <Card>
        <Card.Body>ERROR: Role not found in context</Card.Body>
      </Card>
    );
  }

  if (errorMsg) {
    return (
      <Card>
        <Card.Body>{errorMsg}</Card.Body>
      </Card>
    );
  }

  // called when the selectors are changed for the adding of new granted groups
  const handleAddGrantedChange = (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();

    // user has chosen to add a new grant
    if (event.target.id === "add_new" && event.target.value !== "--remove--") {
      console.log("Add " + event.target.value + " to list of granted groups");
      let new_grant = event.target.value;
      event.target.value = "--remove--";
      setAddGranted([...addGranted, new_grant]);
    }
  };

  // toggle to remove an added grant
  const handleRemoveAddedGrant = (grant_name: string) => {
    console.log("remove: " + grant_name);
    let new_list = [...addGranted].filter((item) => item !== grant_name);
    setAddGranted(new_list);
  };

  // toggle to remove an existing grant
  const toggleExistingGrant = (grant_name: string) => {
    if (removeGranted.includes(grant_name)) {
      setRemoveGranted(
        [...removeGranted].filter((item) => item !== grant_name)
      );
    } else {
      setRemoveGranted([...removeGranted, grant_name]);
    }
  };

  const existing_grants = () => {
    /// All our elements for managing group removals
    let elements: JSX.Element[] = [];
    role
      .getGrantedToList()
      .sort()
      .forEach((granted_name: string, index) => {
        elements.push(
          <tr key={granted_name + "_del"}>
            <td key={granted_name + "_del"}>
              <Form.Switch
                type="switch"
                id={granted_name + "_del"}
                key={granted_name + "_del"}
              >
                <Form.Switch.Input
                  className="remove-switch"
                  checked={removeGranted.includes(granted_name)}
                  onChange={() => toggleExistingGrant(granted_name)}
                ></Form.Switch.Input>
                <Form.Switch.Label className="remove-switch-label">
                  {granted_name}
                </Form.Switch.Label>
              </Form.Switch>
            </td>
          </tr>
        );
      });

    return elements;
  };

  let new_grants = () => {
    let elements: JSX.Element[] = [];
    let group_options: JSX.Element[] = [];
    group_options.push(
      <option key="option_remove" value="--remove--">
        ---
      </option>
    );
    groups.sort().forEach((name) => {
      if (
        !role.getGrantedToList().includes(name) &&
        !addGranted.includes(name)
      ) {
        group_options.push(
          <option key={"option_" + name} value={name}>
            {name}
          </option>
        );
      }
    });

    [...addGranted].sort().forEach((granted_name, index) => {
      elements.push(
        <tr key={"add_" + index}>
          <td key={"add_" + index} className="small-button-entity">
            <FontAwesomeIcon
              icon={faSquareXmark}
              className="icon"
              inverse
              onClick={() => handleRemoveAddedGrant(granted_name)}
            />
            {granted_name}
          </td>
        </tr>
      );
    });

    elements.push(
      <tr key={"add_new"}>
        <td key={"add_new"}>
          <Form.Select
            key={"add_new"}
            id={"add_new"}
            onChange={handleAddGrantedChange}
          >
            {group_options}
          </Form.Select>
        </td>
      </tr>
    );

    return elements;
  };

  return (
    <Form onSubmit={handleSubmit(handleUpdate, onError)}>
      {statusMsg && <Alert variant="success">{statusMsg}</Alert>}
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{role.getName()}</Card.Title>
          <Card.Subtitle>
            <Form.Control
              className="desc"
              id="desc"
              defaultValue={role.getDesc()}
              placeholder="Optional description"
              {...register("desc", {
                required: false,
              })}
            />
          </Card.Subtitle>
          <Table className="showEntryTable">
            <thead>
              <tr>
                <th>Granted To</th>
              </tr>
            </thead>
            <tbody>{existing_grants()}</tbody>
            <thead>
              <tr>
                <th>Grant to</th>
              </tr>
            </thead>
            <tbody>{new_grants()}</tbody>
          </Table>
          <Button type="submit">Save</Button>
        </Card.Body>
      </Card>
    </Form>
  );
}
