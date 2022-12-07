import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, Card, Container, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";
import { usePageContext } from "./RolesPage";

export default function EditRole() {
  const navigate = useNavigate();
  const { name } = useParams();
  const { client, setErrorMsg, setStatusMsg, roles, setRoles } =
    usePageContext();
  const { register, handleSubmit } = useForm({ mode: "all" });
  const onError = (errors: any) => {};

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

    client
      .modifyRole(req, null)
      .then((response: proto.roles.RoleResponse) => {
        let updated_role = response.getRole();

        if (!updated_role) {
          setErrorMsg("No update role returned from server");
          return;
        }

        console.log("Updated!");
        setStatusMsg("Role " + updated_role.getName() + " updated!");
        setRoles(roles.set(updated_role.getName(), updated_role));
        setAddGranted([]);
        setRemoveGranted([]);
        navigate("/roles/view/" + updated_role.getName());
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      });
  };

  /// load the group names
  useEffect(() => {
    let request = new proto.groups.GetGroupsRequest();

    client
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <SectionItem key={granted_name + "_del"}>
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
          </SectionItem>
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
        <SectionItem key={"add_" + index}>
          <FontAwesomeIcon
            icon={faSquareXmark}
            className="delete-icon-btn"
            inverse
            onClick={() => handleRemoveAddedGrant(granted_name)}
          />
          {granted_name}
        </SectionItem>
      );
    });

    elements.push(
      <SectionItem key={"add_new"}>
        <Form.Select
          style={{ padding: "0px 20px" }}
          key={"add_new"}
          id={"add_new"}
          onChange={handleAddGrantedChange}
        >
          {group_options}
        </Form.Select>
      </SectionItem>
    );

    return elements;
  };

  return (
    <Form onSubmit={handleSubmit(handleUpdate, onError)}>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{role.getName()}</Card.Title>
          <Card.Subtitle>
            <Form.Control
              className="desc"
              id="desc"
              defaultValue={role.getDesc()}
              as="textarea"
              placeholder="Optional description"
              {...register("desc", {
                required: false,
              })}
            />
          </Card.Subtitle>
          <SectionHeader>Granted to</SectionHeader>
          {existing_grants()}
          <SectionHeader>Grant to</SectionHeader>
          {new_grants()}
          <Card.Footer>
            <Button type="submit">Save</Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Form>
  );
}
