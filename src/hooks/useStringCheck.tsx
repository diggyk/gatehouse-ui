import { useState } from "react";

export type StringCheck = {
  matchType: number;
  setMatchType: Function;
  matchList: Set<string>;
  setMatchList: Function;
};

export default function useStringCheck(): StringCheck {
  const [matchType, setMatchType]: [number, Function] = useState(-1);
  const [matchList, setMatchList]: [Set<string>, Function] = useState(
    new Set()
  );

  return {
    matchType,
    setMatchType,
    matchList,
    setMatchList,
  };
}
