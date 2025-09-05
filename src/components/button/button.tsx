"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { ButtonProps, ShadcnButton, Spinner } from "@/components/";

interface Props extends ButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  tooltipContent?: React.ReactNode;
}

const Button = ({
  children,
  icon,
  className,
  isLoading = false,
  tooltipContent,
  ...rest
}: Props) => {
  return (
    <ShadcnButton
      className={twMerge("flex items-center justify-center gap-3", className)}
      title={typeof tooltipContent === "string" ? tooltipContent : undefined}
      {...rest}
    >
      {isLoading ? (
        <div className="flex w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-2">
          {icon}
          {children}
        </div>
      )}
    </ShadcnButton>
  );
};

export { Button };
