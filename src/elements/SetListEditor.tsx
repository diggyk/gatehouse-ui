import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, PropsWithChildren, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useForm, ValidationRule } from "react-hook-form";
import SectionHeader from "./SectionHeader";
import SectionItem from "./SectionItem";

interface Props {
  list: Set<string>;
  setList: Function;
  initialVals?: string[];
  optionsList?: string[];
  freeFormAdd?: boolean;
  freeFormPlaceholder?: string;
  freeFormValidation?: ValidationRule<RegExp>;
  sectionHeader?: string;
}

export default function SetListEditor(props: PropsWithChildren<Props>) {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" });

  useEffect(() => {
    if (props.initialVals) {
      let new_set = new Set();
      props.initialVals.forEach((v) => {
        new_set.add(v);
      });
      props.setList(new_set);
    }
  }, [props.initialVals]);

  // handle new values added from drop down list
  const handleAddItemChange = (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    if (event.target.id === "add_new" && event.target.value !== "--remove--") {
      let new_value = event.target.value;
      event.target.value = "--remove--";
      props.list.add(new_value);
      props.setList(new Set(props.list));
    }
  };

  const removeFromList = (item: string) => {
    props.list.delete(item);
    props.setList(new Set(props.list));
  };

  const newListItem = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !errors.newitem) {
      event.preventDefault();
      let val = event.currentTarget.value.trim();
      if (val.length > 0) {
        props.list.add(val);
        props.setList(new Set(props.list));
        event.currentTarget.value = "";
      }
    }
  };

  let elements: JSX.Element[] = [];

  // build display of items in the set
  if (props.list.size > 0)
    [...props.list].sort().forEach((listitem) => {
      elements.push(
        <SectionItem key={"item_" + listitem}>
          <FontAwesomeIcon
            icon={faSquareXmark}
            className="delete-icon-btn"
            inverse
            onClick={() => removeFromList(listitem)}
          />
          {listitem}
        </SectionItem>
      );
    });
  else {
    elements.push(<SectionItem key="noattrib">No attributes</SectionItem>);
  }

  // if a free form field for adding values is desired, add that now
  if (props.freeFormAdd) {
    let freeFormValidation = props.freeFormValidation
      ? props.freeFormValidation
      : {
          value: /^.*$/i,
          message: "",
        };
    elements.push(
      <SectionItem key={"add_new"}>
        <Form.Control
          className="inline-input"
          placeholder={props.freeFormPlaceholder}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            newListItem(event);
          }}
          {...register("newitem", {
            required: false,
            pattern: freeFormValidation,
          })}
        />
        {errors && errors.newitem && errors.newitem.message && (
          <p className="formError">{errors.newitem.message.toString()}</p>
        )}
      </SectionItem>
    );
  }

  // if a list of possible options are given for a drop down list, add that now
  if (props.optionsList) {
    let remaining_options = props.optionsList
      ?.sort()
      .filter((o) => !props.list.has(o));

    let options: JSX.Element[] = [];
    if (remaining_options.length > 0) {
      options.push(
        <option key="option_remove" value="--remove--">
          ---
        </option>
      );
      remaining_options.forEach((name) => {
        options.push(
          <option key={"option_" + name} value={name}>
            {name}
          </option>
        );
      });
    } else {
      options.push(
        <option key="option_remove" value="--remove--">
          No remaining options
        </option>
      );
    }

    elements.push(
      <SectionItem key={"add_new"}>
        <Form.Select
          style={{ padding: "0px 20px" }}
          key={"add_new"}
          id={"add_new"}
          onChange={handleAddItemChange}
          disabled={remaining_options.length === 0}
        >
          {options}
        </Form.Select>
      </SectionItem>
    );
  }

  if (props.sectionHeader) {
    elements.splice(
      0,
      0,
      <SectionHeader key="setlistheader">{props.sectionHeader}</SectionHeader>
    );
  }

  return <>{elements}</>;
}
