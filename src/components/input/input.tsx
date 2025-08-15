"use client";
import React, { InputHTMLAttributes } from "react";

import { icons, IIcons } from "@/utils";
import { withMask } from "use-mask-input";
import { ShadcnInput } from "../ui";

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IIcons;
  children?: React.ReactNode;
  mask?: string[];
}

const Input = ({ icon, children, mask, placeholder, ...rest }: Props) => {
  return (
    <div className="flex w-full items-center justify-between gap-1 border-none">
      <div className="flex w-full items-center gap-1 rounded shadow">
        {icon && (
          <div className="pl-1 opacity-50">
            {React.createElement(icons[icon])}
          </div>
        )}
        <ShadcnInput
          ref={withMask(mask ?? null)}
          placeholder={placeholder}
          {...rest}
        />{" "}
      </div>
      {children}
    </div>
  );
};

export { Input };
