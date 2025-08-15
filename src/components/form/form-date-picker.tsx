import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { ShadcnButton as Button } from "@/components/ui/button";
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
import { icons } from "@/utils/icons";

type FormFields<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  disabled?: boolean;
};

interface Props<T extends FieldValues> {
  form: UseFormReturn<T>;
  fields: FormFields<T>;
}

const FormDatePicker = <T extends FieldValues>({ form, fields }: Props<T>) => {
  return (
    <Form {...form}>
      <div className="w-full space-y-8">
        <FormField
          control={form.control}
          name={fields.name}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{fields.label}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      disabled={fields.disabled}
                      data-testid={`datepicker-${fields.name}`}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-[8px] border-none pl-3 text-left font-normal shadow",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span className="text-[#718096]">
                          Selecione uma Data
                        </span>
                      )}
                      <icons.calendar />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-[8px] bg-zinc-800 p-0 text-[--primary-foreground]"
                  align="start"
                ></PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};

export { FormDatePicker };
