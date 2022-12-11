import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithChildren } from "react";

interface Props {
  leftIcon?: IconDefinition;
  rightIcon?: IconDefinition;
  onClick: Function;
}

export default function ClickableItem(props: PropsWithChildren<Props>) {
  return (
    <span
      className="clickable-item"
      onClick={() => (props.onClick ? props.onClick() : {})}
    >
      {props.leftIcon && (
        <FontAwesomeIcon
          icon={props.leftIcon}
          className={"icon left"}
          inverse
          onClick={() => (props.onClick ? props.onClick() : {})}
        />
      )}
      <span className="content">{props.children}</span>
      {props.rightIcon && (
        <FontAwesomeIcon
          icon={props.rightIcon}
          className={"icon right"}
          inverse
        />
      )}
    </span>
  );
}
