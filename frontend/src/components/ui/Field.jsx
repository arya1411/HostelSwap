import React from "react";

export function Field({ label, children }) {
  const generated = React.useId();
  const input =
    React.isValidElement(children) &&
    ["input", "select", "textarea"].includes(children.type);
  const id = children?.props?.id || generated;
  return (
    <div className="field">
      <label htmlFor={input ? id : undefined}>{label}</label>
      {input ? React.cloneElement(children, { id }) : children}
    </div>
  );
}
