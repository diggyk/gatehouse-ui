import { PropsWithChildren } from "react";

export default function SectionHeader(props: PropsWithChildren) {
  return <span className="section-header">{props.children}</span>;
}
