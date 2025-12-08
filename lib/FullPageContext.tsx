import { createContext, useContext } from "react";
import { FullPageContextType } from "./types";

export const FullPageContext = createContext<FullPageContextType | undefined>(
  undefined
);

export const useFullPage = (): FullPageContextType => {
  const context = useContext(FullPageContext);
  if (!context) {
    throw new Error("useFullPage must be used within a FullPage provider");
  }
  return context;
};
