import { MouseEventHandler, PropsWithChildren } from "react";

interface Props {
  leftButton?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  className?: string;
}

export default function ExpandoItem(props: PropsWithChildren<Props>) {
  let classnames = ["expando-item"];
  props.leftButton
    ? classnames.push("left-button")
    : classnames.push("right-button");
  if (props.onClick) classnames.push("clickable");

  const onClick = props.onClick ? props.onClick : () => {};

  let classNamesStr = classnames.join(" ");
  if (props.className) {
    classNamesStr += " " + props.className;
  }

  return (
    <span className={classNamesStr} onClick={onClick}>
      {props.children}
    </span>
  );
}
