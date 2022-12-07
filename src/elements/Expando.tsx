import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithChildren, useState } from "react";

interface Props {
  expand?: boolean;
  title: string;
}

export default function Expando(props: PropsWithChildren<Props>) {
  const [expand, setExpand] = useState(props.expand || false);
  const [title, _] = useState(props.title || "");

  const toggleExpand = () => {
    setExpand(!expand);
  };

  const chevron = expand ? faChevronDown : faChevronUp;

  let headerClasses = ["expando-header"];
  if (expand) headerClasses.push("expanded");

  return (
    <div className="expando">
      <span className={headerClasses.join(" ")} onClick={toggleExpand}>
        {title}
        <FontAwesomeIcon icon={chevron} />
      </span>
      {expand && <span className="expando-body">{props.children}</span>}
    </div>
  );
}
