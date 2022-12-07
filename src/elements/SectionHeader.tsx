import { PropsWithChildren } from "react";

interface Props {
  rightIcon?: JSX.Element;
}

export default function SectionHeader(props: PropsWithChildren<Props>) {
  return (
    <span className="section-header">
      {props.children}
      {props.rightIcon && (
        <span
          style={{
            float: "right",
            position: "relative",
            left: "20px",
          }}
        >
          {props.rightIcon}
        </span>
      )}
    </span>
  );
}
