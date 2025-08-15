/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { ShadcnButton as Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { icons, IIcons } from "@/utils";
import { IOption } from "@/types";

type FormFields<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  icon: IIcons;
  placeholder: string;
  options: IOption[];
  disabled?: boolean;
};

interface Props<T extends FieldValues> {
  form: UseFormReturn<T>;
  fields: FormFields<T>;
}

const FormSelect = <T extends FieldValues>({ form, fields }: Props<T>) => {
  const options = React.useMemo(() => fields.options || [], [fields.options]);
  const [inputValue, setInputValue] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    return options.filter((item) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue, options]);

  const getCurrentValue = (fieldValue: any) => {
    if (fieldValue === undefined) return undefined;

    // Convert to string for comparison if the value is a number
    const normalizedFieldValue =
      typeof fieldValue === "number" ? String(fieldValue) : fieldValue;

    return (
      options.find((item) => {
        const normalizedItemValue =
          typeof item.value === "number" ? String(item.value) : item.value;
        return normalizedItemValue === normalizedFieldValue;
      })?.label ?? "Selecione uma opção"
    );
  };

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name={fields.name}
        render={({ field }) => (
          <FormItem className="w-full space-y-1">
            <FormLabel>{fields.label}</FormLabel>
            <div className="relative z-10 flex h-9 w-full items-center justify-between gap-1 rounded shadow">
              <div className="ml-1 opacity-50">
                {React.createElement(icons[fields.icon])}
              </div>
              <Popover>
                <PopoverTrigger disabled={fields.disabled} asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      data-testid={`select-${fields.name}`}
                      aria-expanded="true"
                      aria-controls="select-options"
                      className={cn(
                        "w-full justify-between border-transparent",
                        field.value === undefined && "text-[#718096]"
                      )}
                    >
                      {getCurrentValue(field.value) || fields.placeholder}
                      <icons.chevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full border-transparent p-0">
                  <Command className="w-full">
                    <CommandInput
                      data-testid="input-form-select"
                      placeholder="Buscar..."
                      className="h-9"
                      value={inputValue}
                      onValueChange={setInputValue}
                    />
                    <CommandEmpty>Não encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandList className="w-full" id="select-options">
                        {filteredOptions.map((item) => {
                          const isSelected =
                            typeof field.value === "number"
                              ? String(item.value) === String(field.value)
                              : item.value === field.value;

                          return (
                            <CommandItem
                              className="hover:bg-[--primary-foreground]/90 cursor-pointer transition duration-200"
                              value={String(item.value)}
                              key={String(item.value)}
                              onSelect={() => {
                                form.setValue(fields.name, item.value as any);
                              }}
                              aria-selected={isSelected}
                              data-testid={item.label}
                            >
                              {item.label}
                              <icons.check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

export { FormSelect };
