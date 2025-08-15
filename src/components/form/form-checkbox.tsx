import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type FormFields<T extends FieldValues> = {
  name: Path<T>
  label: string
  description: string
}

interface Props<T extends FieldValues> {
  form: UseFormReturn<T>
  fields: FormFields<T>
}

const FormCheckbox = <T extends FieldValues>({ form, fields }: Props<T>) => {
  return (
    <Form {...form}>
      <div className="w-full space-y-8">
        <FormField
          control={form.control}
          name={fields.name}
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex w-full flex-row items-start space-x-3 space-y-0 rounded border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={value}
                  onCheckedChange={onChange}
                  data-testid={`checkbox-${fields.name}`}
                />
              </FormControl>
              <div className="flex-col space-y-1 leading-none">
                <FormLabel>{fields.label}</FormLabel>
                <FormDescription>{fields.description}</FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

export { FormCheckbox }
