"use client";
import { ReactNode } from "react";

import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IIcons } from "@/utils";
import { Input } from "../input";

type FormFields<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  icon?: IIcons;
  prefix?: string;
  mask?: string[];
  children?: ReactNode;
  description?: string;
  readonly?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

interface Props<T extends FieldValues> {
  form: UseFormReturn<T>;
  fields: FormFields<T>;
}

const FormInput = <T extends FieldValues>({ form, fields }: Props<T>) => {
  return (
    <Form {...form}>
      <FormField
        key={fields.id}
        control={form.control}
        name={fields?.name}
        render={({ field }) => (
          <FormItem className="w-full space-y-1">
            <FormLabel htmlFor={fields?.name}>{fields.label}</FormLabel>
            <FormControl>
              <Input
                {...fields}
                {...field}
                data-testid={`input-${fields.name}`}
                {...(fields.type === "file"
                  ? { value: undefined }
                  : { value: field.value })}
                onChange={(e) => {
                  if (fields.type === "file") {
                    const file = e.target.files?.[0] ?? null;
                    form.setValue(
                      fields.name,
                      file as unknown as T[typeof fields.name]
                    );
                    return;
                  }
                  const isNumber = fields.type === "number";
                  const value = e.target.value;
                  fields?.onChange?.(e);
                  return field.onChange(isNumber ? Number(value) : value);
                }}
              />
            </FormControl>
            {fields.description && (
              <FormDescription>{fields.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

export { FormInput };
